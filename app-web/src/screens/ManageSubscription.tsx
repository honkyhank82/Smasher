import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscriptionService, SubscriptionStatus } from '../services/subscriptionService'
import '../styles/premium.css'

export default function ManageSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true)
        const data = await subscriptionService.getSubscriptionStatus()
        setStatus(data)
      } catch (error) {
        console.error('Failed to load subscription status:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStatus()
  }, [])

  const handleUpgrade = async () => {
    try {
      setProcessing(true)
      const origin = window.location.origin
      const successUrl = `${origin}/premium?upgrade=success`
      const cancelUrl = `${origin}/premium?upgrade=cancel`
      const { url } = await subscriptionService.createCheckoutSession(successUrl, cancelUrl)
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Failed to start checkout:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleManagePayment = async () => {
    try {
      setProcessing(true)
      const origin = window.location.origin
      const returnUrl = `${origin}/premium`
      const { url } = await subscriptionService.createPortalSession(returnUrl)
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Failed to open subscription portal:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = async () => {
    const confirmed = window.confirm(
      'Cancel your subscription? You will keep access until the end of the billing period.',
    )
    if (!confirmed) return

    try {
      setProcessing(true)
      await subscriptionService.cancelSubscription()
      const data = await subscriptionService.getSubscriptionStatus()
      setStatus(data)
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReactivate = async () => {
    try {
      setProcessing(true)
      await subscriptionService.reactivateSubscription()
      const data = await subscriptionService.getSubscriptionStatus()
      setStatus(data)
    } catch (error) {
      console.error('Failed to reactivate subscription:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="premium-container">
        <div className="premium-card">
          <div className="premium-loading">Loading subscription...</div>
        </div>
      </div>
    )
  }

  const isPremium = status?.isPremium
  const subscription = status?.subscription || null
  const expiryDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
    : 'N/A'

  if (!isPremium) {
    return (
      <div className="premium-container">
        <div className="premium-card">
          <h2>No Active Subscription</h2>
          <p>You do not currently have an active premium subscription.</p>
          <button
            className="primary-btn"
            onClick={handleUpgrade}
            disabled={processing}
          >
            {processing ? 'Starting checkout...' : 'Upgrade to Premium'}
          </button>
          <button className="secondary-link" onClick={() => navigate('/profile')}>
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  const priceText = subscription
    ? `$${subscription.amount}/${subscription.currency}`
    : '$9.99/USD'

  return (
    <div className="premium-container">
      <div className="premium-card">
        <div className="premium-header">
          <span className="badge">Premium</span>
          <h2>Your Subscription</h2>
        </div>

        <div className="premium-details">
          <div className="detail-row">
            <span className="label">Plan</span>
            <span className="value">Premium Monthly</span>
          </div>
          <div className="detail-row">
            <span className="label">Price</span>
            <span className="value">{priceText}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status</span>
            <span className="value status-active">
              {subscription?.status === 'active' ? 'Active' : subscription?.status || 'Active'}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">{subscription?.cancelAtPeriodEnd ? 'Active Until' : 'Renews On'}</span>
            <span className="value">{expiryDate}</span>
          </div>
        </div>

        {subscription?.cancelAtPeriodEnd && (
          <div className="premium-warning">
            <h3>Subscription Ending</h3>
            <p>
              Your subscription is set to cancel on {expiryDate}. You will lose access to
              premium features after this date.
            </p>
            <button
              className="primary-btn"
              onClick={handleReactivate}
              disabled={processing}
            >
              {processing ? 'Working...' : 'Reactivate Subscription'}
            </button>
          </div>
        )}

        <div className="premium-benefits">
          <h3>Your Premium Benefits</h3>
          <ul>
            <li>Unlimited messages</li>
            <li>See who viewed your profile</li>
            <li>Advanced search filters</li>
            <li>Up to 6 photos on your profile</li>
            <li>Profile boost (10x visibility)</li>
            <li>No ads</li>
            <li>Read receipts</li>
            <li>Priority support</li>
          </ul>
        </div>

        <button
          className="primary-btn"
          onClick={handleManagePayment}
          disabled={processing}
        >
          {processing ? 'Opening portal...' : 'Manage Payment Method'}
        </button>

        {!subscription?.cancelAtPeriodEnd && (
          <button
            className="danger-btn"
            onClick={handleCancel}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Cancel Subscription'}
          </button>
        )}

        <button className="secondary-link" onClick={() => navigate('/profile')}>
          Back to Profile
        </button>
      </div>
    </div>
  )
}
