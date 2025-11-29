import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/home.css'

export default function Home() {
  interface User {
    name?: string
  }

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        const isValid = parsed && typeof parsed === 'object' && (parsed.name === undefined || typeof parsed.name === 'string')
        if (isValid) {
          setUser(parsed as User)
        } else {
          console.warn('Invalid user data in localStorage; clearing')
          localStorage.removeItem('user')
          setUser(null)
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e)
        localStorage.removeItem('user')
        setUser(null)
      }
    }
  }, [])

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🔥 SMASHER</h1>
        </div>
        <div className="nav-links">
          <Link to="/discover">Discover</Link>
          <Link to="/chat">Messages</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/settings">Settings</Link>
        </div>
      </nav>

      <div className="home-content">
        <div className="welcome-section">
          <h2>Welcome back, {user?.name || 'User'}!</h2>
          <p>Find and connect with interesting people nearby</p>
        </div>

        <div className="quick-actions">
          <Link to="/discover" className="action-card">
            <div className="icon">🔍</div>
            <h3>Discover</h3>
            <p>Find people near you</p>
          </Link>

          <Link to="/chat" className="action-card">
            <div className="icon">💬</div>
            <h3>Messages</h3>
            <p>Chat with connections</p>
          </Link>

          <Link to="/profile" className="action-card">
            <div className="icon">👤</div>
            <h3>Profile</h3>
            <p>View and edit your profile</p>
          </Link>
        </div>

        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>✓ Real-time chat with location sharing</li>
            <li>✓ Discover users based on proximity</li>
            <li>✓ Upload and manage photos</li>
            <li>✓ Premium membership available</li>
            <li>✓ Automatic failover for reliability</li>
          </ul>
        </div>
      </div>
    </div>
  )
}