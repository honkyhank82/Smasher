import { Controller, Post, Get, Delete, Body, Req, UseGuards, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import Stripe from 'stripe';

@Controller('subscriptions')
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-09-30.clover',
      });
      this.logger.log('Stripe initialized in controller');
    }
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  /**
   * Create checkout session
   * POST /subscriptions/checkout
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Req() req: any,
    @Body() body: { successUrl: string; cancelUrl: string },
  ) {
    const userId = req.user.userId;
    return this.subscriptionsService.createCheckoutSession(
      userId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  /**
   * Create portal session for managing subscription
   * POST /subscriptions/portal
   */
  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async createPortal(
    @Req() req: any,
    @Body() body: { returnUrl: string },
  ) {
    const userId = req.user.userId;
    return this.subscriptionsService.createPortalSession(userId, body.returnUrl);
  }

  /**
   * Get subscription status
   * GET /subscriptions/status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() req: any) {
    const userId = req.user.userId;
    return this.subscriptionsService.getSubscriptionStatus(userId);
  }

  /**
   * Cancel subscription
   * DELETE /subscriptions/cancel
   */
  @Delete('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: any) {
    const userId = req.user.userId;
    return this.subscriptionsService.cancelSubscription(userId);
  }

  /**
   * Reactivate subscription
   * POST /subscriptions/reactivate
   */
  @Post('reactivate')
  @UseGuards(JwtAuthGuard)
  async reactivateSubscription(@Req() req: any) {
    const userId = req.user.userId;
    return this.subscriptionsService.reactivateSubscription(userId);
  }

  /**
   * Stripe webhook endpoint
   * POST /subscriptions/webhook
   * 
   * This endpoint receives events from Stripe when subscriptions change
   * Must be publicly accessible (no auth guard)
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      this.logger.error('No stripe-signature header found');
      throw new Error('No stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      // Get raw body for signature verification
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new Error('No raw body available');
      }

      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );

      this.logger.log(`Received webhook event: ${event.type}`);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      await this.subscriptionsService.handleWebhook(event);
      return { received: true };
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`);
      throw error;
    }
  }
}
