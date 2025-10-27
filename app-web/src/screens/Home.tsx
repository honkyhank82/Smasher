import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/home.css'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
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