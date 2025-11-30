import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { apiFailoverService } from './services/api-failover'
import Auth from './screens/Auth'
import Home from './screens/Home'
import Profile from './screens/Profile'
import Chat from './screens/Chat'
import Discover from './screens/Discover'
import ManageSubscription from './screens/ManageSubscription'
import Gallery from './screens/Gallery'
import UserProfile from './screens/UserProfile'
import Settings from './screens/Settings'
import Terms from './screens/Terms'
import Privacy from './screens/Privacy'
import Help from './screens/Help'
import Admin from './screens/Admin'

import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [serverStatus, setServerStatus] = useState<string>('Connecting...')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        setIsAuthenticated(true)
        try {
          const rawUser = localStorage.getItem('user')
          if (rawUser) {
            const parsed = JSON.parse(rawUser)
            setIsAdmin(!!parsed?.isAdmin)
          } else {
            setIsAdmin(false)
          }
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }

      setLoading(false)
    }
    checkAuth()

    // Check server status
    const checkServer = async () => {
      try {
        const service = apiFailoverService.getCurrentService()
        const response = await fetch(`${service.apiUrl}/health`)
        if (response.ok) {
          setServerStatus(`Connected to ${service.name}`)
        }
      } catch (error) {
        setServerStatus('Checking connection...')
      }
    }

    checkServer()
    const interval = setInterval(checkServer, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {!isAuthenticated ? (
            <Route path="*" element={<Auth setIsAuthenticated={setIsAuthenticated} />} />
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route path="/premium" element={<ManageSubscription />} />
              <Route path="/settings" element={<Settings />} />
              {isAdmin && <Route path="/admin" element={<Admin />} />}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/help" element={<Help />} />
              <Route path="/profile" element={<Profile setIsAuthenticated={setIsAuthenticated} />} />
            </>
          )}
        </Routes>
        <div className="server-status">
          <span>{serverStatus}</span>
        </div>
      </div>
    </Router>
  )
}

export default App