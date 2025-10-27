import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFailoverService } from '../services/api-failover'
import '../styles/profile.css'

interface ProfileProps {
  setIsAuthenticated: (auth: boolean) => void
}

export default function Profile({ setIsAuthenticated }: ProfileProps) {
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await apiFailoverService.get('/users/profile')
      setUser(response.data)
      setFormData({
        name: response.data.name,
        age: response.data.age,
        bio: response.data.bio,
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiFailoverService.put('/users/profile', formData)
      setUser(response.data)
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    apiFailoverService.removeAuthToken()
    setIsAuthenticated(false)
    navigate('/')
  }

  if (loading) return <div className="loading">Loading profile...</div>

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button onClick={() => setEditing(!editing)} className="edit-btn">
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="profile-content">
        {user && (
          <>
            <img
              src={user.profilePhoto || '/default-avatar.png'}
              alt={user.name}
              className="profile-photo"
            />

            {editing ? (
              <form onSubmit={handleUpdate} className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <button type="submit">Save Changes</button>
              </form>
            ) : (
              <div className="profile-info">
                <h3>{user.name}, {user.age}</h3>
                <p className="bio">{user.bio}</p>

                <div className="profile-stats">
                  <div className="stat">
                    <span className="label">Premium</span>
                    <span className="value">{user.isPremium ? 'Active' : 'Free'}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Profile Views</span>
                    <span className="value">{user.viewCount || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}