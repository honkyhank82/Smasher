import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiFailoverService } from '../services/api-failover'
import '../styles/user-profile.css'

interface UserSummary {
  id: string
  name?: string
  age?: number
  bio?: string
  distance?: number
  profilePhoto?: string
  isOnline?: boolean
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserSummary | null>(
    (location.state as any)?.user || null,
  )
  const [loading, setLoading] = useState(!user)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        setLoading(true)
        // Fetch profile from the backend
        const response = await apiFailoverService.get(`/profiles/${id}`)
        const data = response.data
        if (data && typeof data === 'object') {
          setUser({
            id: String(data.id || id),
            name: data.displayName || 'User',
            age: data.age,
            bio: data.bio,
            distance: data.distance,
            profilePhoto: data.profilePicture,
            isOnline: data.isOnline,
            // Include additional profile fields
            ...data
          })
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        // Keep any existing state from navigation
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      load()
    }
  }, [id])

  if (!id) {
    return (
      <div className="user-profile-container">
        <p>Missing user id.</p>
      </div>
    )
  }

  if (loading && !user) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-loading">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="user-profile-container">
        <p>Could not load this profile.</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="user-profile-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>

      <div className="user-profile-card">
        <div className="user-profile-photo-wrapper">
          <img
            src={user.profilePhoto || '/default-avatar.png'}
            alt={user.name || 'User'}
            className="user-profile-photo"
          />
          <span
            className={
              user.isOnline
                ? 'status-dot status-dot-online'
                : 'status-dot status-dot-offline'
            }
          />
        </div>
        <h2>
          {user.name || 'User'}
          {user.age ? `, ${user.age}` : ''}
        </h2>
        {user.distance !== undefined && (
          <p className="distance">📍 {user.distance} miles away</p>
        )}
        {user.bio && <p className="bio">{user.bio}</p>}
      </div>
    </div>
  )
}
