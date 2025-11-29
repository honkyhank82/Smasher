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
      <div className="auth-card">
        <h1>🔥 SMASHER</h1>
        <p className="subtitle">Connect with people near you</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
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