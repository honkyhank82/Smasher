import React, { useState } from 'react'
import { apiFailoverService } from '../services/api-failover'
import '../styles/auth.css'

interface AuthProps {
  setIsAuthenticated: (auth: boolean) => void
}

export default function Auth({ setIsAuthenticated }: AuthProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await apiFailoverService.post('/auth/send-verification', { email })
      setStep('code')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiFailoverService.post('/auth/verify', { email, code })
      localStorage.setItem('authToken', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      apiFailoverService.setAuthToken(response.data.access_token)
      setIsAuthenticated(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔥 SMASHER</h1>
        <p className="subtitle">Connect with people near you</p>

        {error && <div className="error-message">{error}</div>}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 6))}
                maxLength={6}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setCode('')
              }}
              className="secondary"
            >
              Back
            </button>
          </form>
        )}

        <p className="terms">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}