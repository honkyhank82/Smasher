import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFailoverService } from '../services/api-failover'
import '../styles/discover.css'

export default function Discover() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [distance, setDistance] = useState(5)
  const navigate = useNavigate()

  useEffect(() => {
    loadNearbyUsers()
  }, [distance])

  const loadNearbyUsers = async () => {
    try {
      setLoading(true)
      const response = await apiFailoverService.get(`/geo/nearby?distance=${distance}`)
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to load nearby users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="discover-container">
      <h2>Discover Nearby Users</h2>

      <div className="filters">
        <label>
          Distance (miles):
          <input
            type="range"
            min="5"
            max="100"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
          />
          <span>{distance} miles</span>
        </label>
        <button onClick={loadNearbyUsers}>Refresh</button>
      </div>

      {loading ? (
        <div className="loading">Loading profiles...</div>
      ) : users.length === 0 ? (
        <div className="empty">No users found in this area</div>
      ) : (
        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <img
                src={user.profilePhoto || '/default-avatar.png'}
                alt={user.name}
                className="user-image"
              />
              <div className="user-info">
                <h3>{user.name}, {user.age}</h3>
                <p>{user.bio}</p>
                <p className="distance">📍 {user.distance} miles away</p>
                <button
                  onClick={() =>
                    navigate(`/user/${user.id}`, {
                      state: { user },
                    })
                  }
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}