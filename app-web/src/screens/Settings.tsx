import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFailoverService } from '../services/api-failover'
import '../styles/settings.css'

interface BackendInfo {
  name: string
  apiUrl: string
}

export default function Settings() {
  const [backend, setBackend] = useState<BackendInfo | null>(null)

  useEffect(() => {
    const service = apiFailoverService.getCurrentService()
    setBackend({ name: service.name, apiUrl: service.apiUrl })
  }, [])

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Account</h3>
        <ul>
          <li>
            <Link to="/premium">Manage Subscription</Link>
          </li>
          <li>
            <Link to="/gallery">Manage Gallery</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
        </ul>
      </section>

      <section className="settings-section">
        <h3>Legal</h3>
        <ul>
          <li>
            <Link to="/terms">Terms of Service</Link>
          </li>
          <li>
            <Link to="/privacy">Privacy Policy</Link>
          </li>
        </ul>
      </section>

      <section className="settings-section">
        <h3>Help & Support</h3>
        <ul>
          <li>
            <Link to="/help">Help & Support</Link>
          </li>
        </ul>
      </section>

      <section className="settings-section">
        <h3>Backend Service</h3>
        {backend ? (
          <div className="backend-info">
            <div>Active Service: <strong>{backend.name}</strong></div>
            <div>API URL: <code>{backend.apiUrl}</code></div>
          </div>
        ) : (
          <div className="backend-info">Loading backend info...</div>
        )}
      </section>
    </div>
  )
}
