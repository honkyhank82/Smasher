import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Subscription } from './subscription.entity';
import { User } from '../users/user.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private stripe: Stripe;
  private readonly priceId: string;

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        this.logger.warn(
          'STRIPE_SECRET_KEY is not configured - subscriptions disabled',
        );
        return;
      }
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-09-30.clover',
      });
      this.priceId =
        process.env.STRIPE_PRICE_ID || 'price_1SNBIbCKpcCZj0lLEYh12CC5';
      this.logger.log('Subscriptions service initialized successfully');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const errStack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`Failed to initialize SubscriptionsService: ${errMsg}`, errStack);
    }
  }

  /** Ensure Stripe client and price ID are initialized */
  private ensureStripeInitialized(): void {
    if (!this.stripe || !this.priceId) {
      throw new BadRequestException(
        'Stripe not initialized: missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID',
      );
    }
  }

  /**
   * Create a Stripe checkout session for a user to subscribe
   */
  async createCheckoutSession(
    userId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    this.ensureStripeInitialized();
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { userId, status: 'active' },
    });

    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Get or create Stripe customer
    let customerId = await this.getStripeCustomerId(user);
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: this.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    this.logger.log(
      `Created checkout session ${session.id} for user ${userId}`,
    );
    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create a portal session for managing subscription
   */
  async createPortalSession(userId: string, returnUrl: string) {
    this.ensureStripeInitialized();
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found for user');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user has premium but their premium period has expired and they do not
    // have an active paid subscription, automatically revert them to free.
    const now = new Date();
    const hasActivePaidSubscription =
      !!subscription &&
      ['active', 'trialing', 'past_due', 'unpaid', 'incomplete'].includes(
        subscription.status,
      );

    if (
      user.isPremium &&
      user.premiumExpiresAt &&
      user.premiumExpiresAt <= now
    ) {
      if (!hasActivePaidSubscription) {
        user.isPremium = false;
        user.premiumExpiresAt = null;
        await this.userRepository.save(user);
      }
    }

    const isFreeTrial =
      !user.isAdmin &&
      user.isPremium &&
      user.premiumExpiresAt &&
      user.premiumExpiresAt > now &&
      !hasActivePaidSubscription;

    return {
      isPremium: user.isAdmin || user.isPremium,
      isFreeTrial,
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            planName: subscription.planName,
            amount: subscription.amount,
            currency: subscription.currency,
          }
        : null,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    this.ensureStripeInitialized();
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const errStack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`Error processing webhook: ${errMsg}`, errStack);
      throw new Error(errMsg);
    }
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    const userId = session.metadata?.userId;
    if (!userId) {
      this.logger.error('No userId in checkout session metadata');
      return;
    }

    const getIdFromUnknown = (v: unknown): string | undefined => {
      if (typeof v === 'string') return v;
      if (v && typeof (v as Record<string, unknown>)['id'] === 'string') return String((v as Record<string, unknown>)['id']);
      return undefined;
    };
    const sessionSubId = getIdFromUnknown(session.subscription) ?? 'unknown';
    this.logger.log(`Checkout completed for user ${userId}, subscription: ${sessionSubId}`);

    // If there's a subscription ID, ensure it's persisted (fallback for delayed subscription.created events)
    if (session.subscription) {
      const subscriptionId = getIdFromUnknown(session.subscription);
      if (!subscriptionId) {
        this.logger.warn('Could not determine subscription id from session');
        return;
      }

      // Check if subscription already exists
      const existingSubscription = await this.subscriptionRepository.findOne({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (!existingSubscription) {
        this.logger.warn(
          `Subscription ${subscriptionId} not found, creating from checkout session`,
        );

        try {
          // Fetch the full subscription from Stripe
          const stripeSubscription =
            await this.stripe.subscriptions.retrieve(subscriptionId);

          // Create subscription using the same logic as handleSubscriptionCreated
          await this.createSubscriptionFromStripe(stripeSubscription);

          this.logger.log(
            `Subscription ${subscriptionId} created from checkout session`,
          );
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const errStack = err instanceof Error ? err.stack : undefined;
          this.logger.error(`Failed to create subscription from checkout session: ${errMsg}`, errStack);
        }
      }
    }
  }

  /**
   * Handle subscription created
   */
  private normalizeStatus(status: unknown): Subscription['status'] {
    const s = String(status);
    const allowed = ['active','canceled','past_due','unpaid','incomplete','trialing'] as const;
    return (allowed.includes(s as any) ? (s as Subscription['status']) : 'active');
  }

  private async handleSubscriptionCreated(
    stripeSubscription: Stripe.Subscription,
  ) {
    await this.createSubscriptionFromStripe(stripeSubscription);
  }

  /**
   * Create subscription record from Stripe subscription data
   */
  private async createSubscriptionFromStripe(
    stripeSubscription: Stripe.Subscription,
  ) {
    const userId = stripeSubscription.metadata?.userId;
    if (!userId) {
      this.logger.error('No userId in subscription metadata');
      return;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`User ${userId} not found`);
      return;
    }

    const stripeRaw = stripeSubscription as unknown as Record<string, unknown>;
    const cps = stripeRaw['current_period_start'];
    const cpe = stripeRaw['current_period_end'];
    const cpsMs = typeof cps === 'number' ? cps * 1000 : Date.now();
    const cpeMs = typeof cpe === 'number' ? cpe * 1000 : Date.now();

    // Normalize Stripe objects safely
    const firstItem = stripeSubscription.items?.data?.[0];
    const price = firstItem?.price;
    const stripePriceId = typeof price?.id === 'string' ? price.id : 'unknown';
    const amount = (typeof price?.unit_amount === 'number' ? price.unit_amount : 999) / 100;
    const currency = (price?.currency || 'USD').toUpperCase();
    const interval = price?.recurring?.interval || 'month';

    let stripeCustomerId: string | undefined;
    if (typeof stripeSubscription.customer === 'string') stripeCustomerId = stripeSubscription.customer;
    else if (stripeSubscription.customer && typeof (stripeSubscription.customer as Stripe.Customer).id === 'string') stripeCustomerId = (stripeSubscription.customer as Stripe.Customer).id;

    const normalizedStatus = this.normalizeStatus(stripeSubscription.status);
    const subscription = this.subscriptionRepository.create({
      userId,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId,
      planName: 'premium',
      amount,
      currency,
      interval,
      status: normalizedStatus,
      currentPeriodStart: new Date(cpsMs),
      currentPeriodEnd: new Date(cpeMs),
      cancelAt: stripeSubscription.cancel_at
        ? new Date(stripeSubscription.cancel_at * 1000)
        : null,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
      trialStart: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: !!stripeSubscription.cancel_at_period_end,
    } as unknown as Partial<Subscription>);

    await this.subscriptionRepository.save(subscription);

    // Update user premium status
    user.isPremium =
      stripeSubscription.status === 'active' ||
      stripeSubscription.status === 'trialing';
    user.premiumExpiresAt = new Date(cpeMs);
    await this.userRepository.save(user);

    this.logger.log(`Subscription created for user ${userId}`);
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription,
  ) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.error(
        `Subscription ${stripeSubscription.id} not found in database`,
      );
      return;
    }

    const stripeRaw = stripeSubscription as unknown as Record<string, unknown>;
    const cps = stripeRaw['current_period_start'];
    const cpe = stripeRaw['current_period_end'];
    const cpsMs = typeof cps === 'number' ? cps * 1000 : Date.now();
    const cpeMs = typeof cpe === 'number' ? cpe * 1000 : Date.now();

    // Update subscription
    subscription.status = this.normalizeStatus(stripeSubscription.status);
    subscription.currentPeriodStart = new Date(cpsMs);
    subscription.currentPeriodEnd = new Date(cpeMs);
    subscription.cancelAt = stripeSubscription.cancel_at
      ? new Date(stripeSubscription.cancel_at * 1000)
      : null;
    subscription.canceledAt = stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000)
      : null;
    const cancelAtPeriodEndRaw = (stripeSubscription as unknown as Record<string, unknown>)['cancel_at_period_end'];
    subscription.cancelAtPeriodEnd = Boolean(cancelAtPeriodEndRaw);

    await this.subscriptionRepository.save(subscription);

    // Update user premium status
    const user = await this.userRepository.findOne({
      where: { id: subscription.userId },
    });
    if (user) {
      user.isPremium =
        stripeSubscription.status === 'active' ||
        stripeSubscription.status === 'trialing';
      user.premiumExpiresAt = new Date(cpeMs);
      await this.userRepository.save(user);
    }

    this.logger.log(
      `Subscription updated for user ${subscription.userId}, status: ${stripeSubscription.status}`,
    );
  }

  /**
   * Handle subscription deleted/canceled
   */
  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription,
  ) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.error(
        `Subscription ${stripeSubscription.id} not found in database`,
      );
      return;
    }

    // Update subscription
    subscription.status = 'canceled';
    subscription.endedAt = new Date();
    await this.subscriptionRepository.save(subscription);

    // Update user premium status
    const user = await this.userRepository.findOne({
      where: { id: subscription.userId },
    });
    if (user) {
      user.isPremium = false;
      user.premiumExpiresAt = null;
      await this.userRepository.save(user);
    }

    this.logger.log(`Subscription canceled for user ${subscription.userId}`);
  }

  /**
   * Handle successful payment
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const invoiceRaw = invoice as unknown as Record<string, unknown>;
    const invoiceSub = invoiceRaw['subscription'];
    if (!invoiceSub) {
      return;
    }
    let subscriptionId: string | undefined;
    if (typeof invoiceSub === 'string') subscriptionId = invoiceSub;
    else if (invoiceSub && typeof (invoiceSub as { id?: unknown }).id === 'string') subscriptionId = (invoiceSub as { id: string }).id;
    else {
      this.logger.warn('Invoice missing subscription id');
      return;
    }
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (subscription) {
      this.logger.log(`Payment succeeded for subscription ${subscription.id}`);
    }
  }

  /**
   * Handle failed payment
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const invoiceRaw = invoice as unknown as Record<string, unknown>;
    const invoiceSub = invoiceRaw['subscription'];
    if (!invoiceSub) {
      return;
    }
    let subscriptionId: string | undefined;
    if (typeof invoiceSub === 'string') subscriptionId = invoiceSub;
    else if (invoiceSub && typeof (invoiceSub as { id?: unknown }).id === 'string') subscriptionId = (invoiceSub as { id: string }).id;
    else {
      this.logger.warn('Invoice missing subscription id');
      return;
    }
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (subscription) {
      subscription.status = 'past_due';
      await this.subscriptionRepository.save(subscription);
      this.logger.warn(`Payment failed for subscription ${subscription.id}`);
    }
  }

  /**
   * Get Stripe customer ID for a user
   */
  private async getStripeCustomerId(user: User): Promise<string | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    return subscription?.stripeCustomerId || null;
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(userId: string) {
    this.ensureStripeInitialized();
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, status: 'active' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const updatedSubscription = await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      },
    );

    const updatedRaw = updatedSubscription as unknown as Record<string, unknown>;
    const updatedCpe = updatedRaw['current_period_end'];
    subscription.cancelAtPeriodEnd = true;
    subscription.cancelAt = typeof updatedCpe === 'number' ? new Date(updatedCpe * 1000) : subscription.cancelAt;
    await this.subscriptionRepository.save(subscription);

    this.logger.log(
      `Subscription ${subscription.id} will cancel at period end`,
    );
    return { success: true, cancelAt: subscription.cancelAt };
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(userId: string) {
    this.ensureStripeInitialized();
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, cancelAtPeriodEnd: true },
    });

    if (!subscription) {
      throw new NotFoundException('No canceled subscription found');
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    subscription.cancelAtPeriodEnd = false;
    subscription.cancelAt = null;
    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Subscription ${subscription.id} reactivated`);
    return { success: true };
  }
}
