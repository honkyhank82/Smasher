import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFailoverService } from '../services/api-failover'
import '../styles/profile.css'

interface AdminUserSummary {
  id: string
  email: string
  isAdmin: boolean
  isPremium: boolean
  accountStatus: string
  createdAt?: string
}

export default function Admin() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchUserId, setSearchUserId] = useState('')
  const [user, setUser] = useState<AdminUserSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [mediaIdToDelete, setMediaIdToDelete] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    // Gate access on cached user.isAdmin
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && parsed.isAdmin) {
          setIsAdmin(true)
          return
        }
      }
    } catch {
      // ignore parse errors
    }
    setIsAdmin(false)
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      // If not admin, send back to home
      const timer = setTimeout(() => navigate('/'), 500)
      return () => clearTimeout(timer)
    }
  }, [isAdmin, navigate])

  const handleLoadByEmail = async () => {
    setError('')
    setActionMessage('')
    setUser(null)
    if (!searchEmail.trim()) return
    try {
      setLoading(true)
      const response = await apiFailoverService.get<AdminUserSummary | null>(
        `/users/admin/by-email`,
        { params: { email: searchEmail.trim() } },
      )
      if (!response.data) {
        setError('No user found for that email')
        return
      }
      setUser(response.data)
      setProfileBio('')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load user by email')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadById = async () => {
    setError('')
    setActionMessage('')
    setUser(null)
    if (!searchUserId.trim()) return
    try {
      setLoading(true)
      const response = await apiFailoverService.get<AdminUserSummary | null>(
        `/users/admin/by-id/${encodeURIComponent(searchUserId.trim())}`,
      )
      if (!response.data) {
        setError('No user found for that id')
        return
      }
      setUser(response.data)
      setProfileBio('')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load user by id')
    } finally {
      setLoading(false)
    }
  }

  const ensureTarget = () => {
    if (!user) {
      setError('Load a user first')
      return false
    }
    return true
  }

  const callUserAction = async (path: string, body?: any) => {
    if (!ensureTarget()) return
    setError('')
    setActionMessage('')
    try {
      setLoading(true)
      const response = await apiFailoverService.post(path, body || {})
      const msg = response?.data?.message || 'Action completed'
      setActionMessage(msg)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = () => {
    if (!user) return
    callUserAction(`/users/admin/deactivate/${user.id}`)
  }

  const handleReactivate = () => {
    if (!user) return
    callUserAction(`/users/admin/reactivate/${user.id}`)
  }

  const handleBan = () => {
    if (!user) return
    callUserAction(`/users/admin/ban/${user.id}`)
  }

  const handleMakeAdmin = () => {
    if (!user) return
    callUserAction(`/users/admin/privileges/${user.id}`, { isAdmin: true })
  }

  const handleRemoveAdmin = () => {
    if (!user) return
    callUserAction(`/users/admin/privileges/${user.id}`, { isAdmin: false })
  }

  const handleUpdateProfile = async () => {
    if (!ensureTarget()) return
    if (!profileBio.trim()) {
      setError('Enter a replacement bio or text (can be empty string to clear)')
      return
    }
    setError('')
    setActionMessage('')
    try {
      setLoading(true)
      await apiFailoverService.patch(`/profiles/admin/${user!.id}`, {
        bio: profileBio,
      })
      setActionMessage('Profile updated')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedia = async () => {
    if (!mediaIdToDelete.trim()) {
      setError('Enter a mediaId to delete')
      return
    }
    setError('')
    setActionMessage('')
    try {
      setLoading(true)
      await apiFailoverService.post(`/media/admin/delete`, { mediaId: mediaIdToDelete.trim() })
      setActionMessage('Media deleted')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete media')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h2>Admin Dashboard</h2>
        </div>
        <p>You do not have access to this page.</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Admin Dashboard</h2>
        <button onClick={() => navigate('/')} className="edit-btn">
          Back Home
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <h3>User Lookup</h3>
          <div className="profile-stats">
            <div className="stat">
              <span className="label">By Email</span>
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="user@example.com"
              />
              <button onClick={handleLoadByEmail} disabled={loading}>
                Load
              </button>
            </div>
            <div className="stat">
              <span className="label">By User ID</span>
              <input
                type="text"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                placeholder="UUID"
              />
              <button onClick={handleLoadById} disabled={loading}>
                Load
              </button>
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}
          {actionMessage && <div className="success-text">{actionMessage}</div>}

          {user && (
            <div className="profile-stats" style={{ marginTop: '1rem' }}>
              <div className="stat">
                <span className="label">User ID</span>
                <span className="value">{user.id}</span>
              </div>
              <div className="stat">
                <span className="label">Email</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="stat">
                <span className="label">Admin</span>
                <span className="value">{user.isAdmin ? 'Yes' : 'No'}</span>
              </div>
              <div className="stat">
                <span className="label">Premium</span>
                <span className="value">{user.isPremium ? 'Yes' : 'No'}</span>
              </div>
              <div className="stat">
                <span className="label">Status</span>
                <span className="value">{user.accountStatus}</span>
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="profile-info" style={{ marginTop: '2rem' }}>
            <h3>Account Controls</h3>
            <div className="profile-stats">
              <div className="stat">
                <button onClick={handleDeactivate} disabled={loading}>
                  Deactivate
                </button>
              </div>
              <div className="stat">
                <button onClick={handleReactivate} disabled={loading}>
                  Reactivate
                </button>
              </div>
              <div className="stat">
                <button onClick={handleBan} disabled={loading}>
                  Ban / Schedule Deletion
                </button>
              </div>
              <div className="stat">
                <button onClick={handleMakeAdmin} disabled={loading}>
                  Make Admin
                </button>
              </div>
              <div className="stat">
                <button onClick={handleRemoveAdmin} disabled={loading}>
                  Remove Admin
                </button>
              </div>
            </div>

            <h3 style={{ marginTop: '1.5rem' }}>Edit Profile Bio</h3>
            <textarea
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              placeholder="Replacement bio text (set to something safe or empty to clear)"
              rows={3}
              style={{ width: '100%' }}
            />
            <button onClick={handleUpdateProfile} disabled={loading} style={{ marginTop: '0.5rem' }}>
              Update Bio
            </button>

            <h3 style={{ marginTop: '1.5rem' }}>Delete Media by ID</h3>
            <input
              type="text"
              value={mediaIdToDelete}
              onChange={(e) => setMediaIdToDelete(e.target.value)}
              placeholder="Media UUID"
              style={{ width: '100%' }}
            />
            <button onClick={handleDeleteMedia} disabled={loading} style={{ marginTop: '0.5rem' }}>
              Delete Media
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
