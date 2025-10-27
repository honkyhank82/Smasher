import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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
        this.logger.warn('STRIPE_SECRET_KEY is not configured - subscriptions disabled');
        return;
      }
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-09-30.clover',
      });
      this.priceId = process.env.STRIPE_PRICE_ID || 'price_1SKS4jRCd67aHvYR8IRdmc1C';
      this.logger.log('Subscriptions service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SubscriptionsService', error);
    }
  }

  /**
   * Create a Stripe checkout session for a user to subscribe
   */
  async createCheckoutSession(userId: string, successUrl: string, cancelUrl: string) {
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

    this.logger.log(`Created checkout session ${session.id} for user ${userId}`);
    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create a portal session for managing subscription
   */
  async createPortalSession(userId: string, returnUrl: string) {
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

    return {
      isPremium: user.isPremium,
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        planName: subscription.planName,
        amount: subscription.amount,
        currency: subscription.currency,
      } : null,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) {
      this.logger.error('No userId in checkout session metadata');
      return;
    }

    this.logger.log(`Checkout completed for user ${userId}, subscription: ${session.subscription}`);
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(stripeSubscription: Stripe.Subscription) {
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

    // Create subscription record
    const subscription = this.subscriptionRepository.create({
      userId,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      planName: 'premium',
      amount: (stripeSubscription.items.data[0].price.unit_amount || 999) / 100,
      currency: stripeSubscription.items.data[0].price.currency.toUpperCase(),
      interval: stripeSubscription.items.data[0].price.recurring?.interval || 'month',
      status: stripeSubscription.status as any,
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAt: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null,
      canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });

    await this.subscriptionRepository.save(subscription);

    // Update user premium status
    user.isPremium = stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing';
    user.premiumExpiresAt = new Date((stripeSubscription as any).current_period_end * 1000);
    await this.userRepository.save(user);

    this.logger.log(`Subscription created for user ${userId}`);
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.error(`Subscription ${stripeSubscription.id} not found in database`);
      return;
    }

    // Update subscription
    subscription.status = stripeSubscription.status as any;
    subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
    subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
    subscription.cancelAt = stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null;
    subscription.canceledAt = stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null;
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    await this.subscriptionRepository.save(subscription);

    // Update user premium status
    const user = await this.userRepository.findOne({ where: { id: subscription.userId } });
    if (user) {
      user.isPremium = stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing';
      user.premiumExpiresAt = new Date((stripeSubscription as any).current_period_end * 1000);
      await this.userRepository.save(user);
    }

    this.logger.log(`Subscription updated for user ${subscription.userId}, status: ${stripeSubscription.status}`);
  }

  /**
   * Handle subscription deleted/canceled
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.error(`Subscription ${stripeSubscription.id} not found in database`);
      return;
    }

    // Update subscription
    subscription.status = 'canceled';
    subscription.endedAt = new Date();
    await this.subscriptionRepository.save(subscription);

    // Update user premium status
    const user = await this.userRepository.findOne({ where: { id: subscription.userId } });
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
    if (!(invoice as any).subscription) {
      return;
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: (invoice as any).subscription as string },
    });

    if (subscription) {
      this.logger.log(`Payment succeeded for subscription ${subscription.id}`);
    }
  }

  /**
   * Handle failed payment
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    if (!(invoice as any).subscription) {
      return;
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: (invoice as any).subscription as string },
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

    subscription.cancelAtPeriodEnd = true;
    subscription.cancelAt = new Date((updatedSubscription as any).current_period_end * 1000);
    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Subscription ${subscription.id} will cancel at period end`);
    return { success: true, cancelAt: subscription.cancelAt };
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, cancelAtPeriodEnd: true },
    });

    if (!subscription) {
      throw new NotFoundException('No canceled subscription found');
    }

    await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      },
    );

    subscription.cancelAtPeriodEnd = false;
    subscription.cancelAt = null;
    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Subscription ${subscription.id} reactivated`);
    return { success: true };
  }
}
