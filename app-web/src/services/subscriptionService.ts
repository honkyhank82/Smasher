import { apiFailoverService } from './api-failover'

export interface SubscriptionStatus {
  isPremium: boolean
  isFreeTrial?: boolean
  subscription: {
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    planName: string
    amount: number
    currency: string
  } | null
}

export const subscriptionService = {
  async createCheckoutSession(successUrl: string, cancelUrl: string) {
    const response = await apiFailoverService.post('/subscriptions/checkout', {
      successUrl,
      cancelUrl,
    })
    return response.data
  },

  async createPortalSession(returnUrl: string) {
    const response = await apiFailoverService.post('/subscriptions/portal', {
      returnUrl,
    })
    return response.data
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await apiFailoverService.get<SubscriptionStatus>('/subscriptions/status')
    return response.data
  },

  async cancelSubscription() {
    const response = await apiFailoverService.delete('/subscriptions/cancel')
    return response.data
  },

  async reactivateSubscription() {
    const response = await apiFailoverService.post('/subscriptions/reactivate')
    return response.data
  },
}
