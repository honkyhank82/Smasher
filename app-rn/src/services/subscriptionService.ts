import api from "./api";

export interface SubscriptionStatus {
  isPremium: boolean;
  isFreeTrial?: boolean;
  subscription: {
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    planName: string;
    amount: number;
    currency: string;
  } | null;
}

export const subscriptionService = {
  /**
   * Create a checkout session for subscribing to premium
   */
  async createCheckoutSession(successUrl: string, cancelUrl: string) {
    const response = await api.post("/subscriptions/checkout", {
      successUrl,
      cancelUrl,
    });
    return response.data;
  },

  /**
   * Create a portal session for managing subscription
   */
  async createPortalSession(returnUrl: string) {
    const response = await api.post("/subscriptions/portal", {
      returnUrl,
    });
    return response.data;
  },

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await api.get("/subscriptions/status");
    return response.data;
  },

  /**
   * Cancel subscription (at period end)
   */
  async cancelSubscription() {
    const response = await api.delete("/subscriptions/cancel");
    return response.data;
  },

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription() {
    const response = await api.post("/subscriptions/reactivate");
    return response.data;
  },
};
