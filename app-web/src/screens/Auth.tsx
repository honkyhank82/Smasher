import React, { useState } from 'react'
import { apiFailoverService } from '../services/api-failover'
import '../styles/auth.css'

interface AuthProps {
  setIsAuthenticated: (auth: boolean) => void
}

export default function Auth({ setIsAuthenticated }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiFailoverService.post('/auth/login', { email, password })
      const token = response?.data?.access_token
      if (!token) {
        throw new Error('Invalid response: missing access_token')
      }

      localStorage.setItem('authToken', token)

      // Store minimal user info for convenience where needed (e.g. welcome message)
      if (response?.data?.user && typeof response.data.user === 'object') {
        try {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        } catch {
          // If storage fails, continue without caching user locally
        }
      }

      apiFailoverService.setAuthToken(token)
      setIsAuthenticated(true)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your email and password.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-card">
        <img src="/logo.png" alt="SMASHER" className="auth-logo" />
        <h1 className="visually-hidden">Sign In</h1>
        <p className="subtitle">Connect with people near you</p>

        {error && <div className="error-message" role="alert">{error}</div>}

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="terms">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}