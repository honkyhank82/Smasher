import React, { useState } from 'react'
import { apiFailoverService } from '../services/api-failover'

interface PremiumBannerProps {
  isPremium?: boolean
}

export default function PremiumBanner({ isPremium }: PremiumBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isPremium || dismissed) return null

  const startCheckout = async () => {
    try {
      setLoading(true)
      const origin = window.location.origin
      const successUrl = `${origin}/profile?upgrade=success`
      const cancelUrl = `${origin}/profile?upgrade=cancel`
      const res = await apiFailoverService.post('/subscriptions/checkout', {
        successUrl,
        cancelUrl,
      })
      const url = res.data?.url
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Failed to start checkout:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.banner}>
      <div style={styles.text}>
        ✨ Go Premium: Unlimited photos/videos, see all viewers, advanced filters — $9.99/mo
      </div>
      <div style={styles.actions}>
        <button onClick={startCheckout} style={styles.upgradeButton} disabled={loading}>
          {loading ? 'Starting…' : 'Upgrade'}
        </button>
        <button onClick={() => setDismissed(true)} style={styles.closeButton}>×</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#2a1a1a',
    border: '1px solid #8B0000',
    borderRadius: 8,
    padding: '8px 12px',
    margin: '12px',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  upgradeButton: {
    backgroundColor: '#8B0000',
    color: '#fff',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
  },
  closeButton: {
    background: 'transparent',
    color: '#ccc',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    padding: '2px 6px',
  },
}