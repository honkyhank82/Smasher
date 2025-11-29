import { useEffect, useState } from 'react'
import { apiFailoverService } from '../services/api-failover'
import '../styles/gallery.css'

interface MediaItem {
  id: string
  url: string
  type: 'photo' | 'video'
}

export default function Gallery() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const response = await apiFailoverService.get('/media/my-media')
      const data = Array.isArray(response.data) ? response.data : []
      const mapped: MediaItem[] = data
        .filter((item: any) => item && typeof item === 'object')
        .map((item: any) => ({
          id: String(item.id),
          url: String(item.url || ''),
          type: item.type === 'video' ? 'video' : 'photo',
        }))
        .filter((m) => m.id && m.url && (m.type === 'photo' || m.type === 'video'))
      setMedia(mapped)
    } catch (error) {
      console.error('Failed to load media:', error)
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, mediaType: 'photo' | 'video') => {
    const file = event.target.files?.[0]
    if (!file) return

    if (media.length >= 6) {
      window.alert('You can upload up to 6 photos/videos')
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      const base64Data: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const uploadResponse = await apiFailoverService.post('/media/upload', {
        fileName: file.name,
        fileType: file.type,
        mediaType,
        fileData: base64Data,
      })

      if (!uploadResponse?.data?.id || !uploadResponse?.data?.url) {
        throw new Error('Invalid upload response: missing id or url')
      }

      setMedia((prev) => [
        ...prev,
        {
          id: String(uploadResponse.data.id),
          url: String(uploadResponse.data.url),
          type: mediaType,
        },
      ])
      window.alert(`${mediaType === 'photo' ? 'Photo' : 'Video'} added to gallery`)
    } catch (error: any) {
      console.error('Upload failed:', error)
      window.alert(error?.message || 'Failed to upload media')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this media item?')
    if (!confirmed) return

    try {
      await apiFailoverService.post('/media/delete', { mediaId: id })
      setMedia((prev) => prev.filter((m) => m.id !== id))
    } catch (error) {
      console.error('Failed to delete media:', error)
      window.alert('Failed to delete media')
    }
  }

  return (
    <div className="gallery-container">
      <h2>My Gallery</h2>
      <p className="gallery-subtitle">Add up to 6 photos and videos to your profile</p>

      <div className="gallery-actions">
        <label className="gallery-upload-btn">
          Add Photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'photo')}
            disabled={uploading}
          />
        </label>
        <label className="gallery-upload-btn">
          Add Video
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileChange(e, 'video')}
            disabled={uploading}
          />
        </label>
      </div>

      {loading ? (
        <div className="gallery-loading">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="gallery-empty">No media yet. Start by adding a photo or video.</div>
      ) : (
        <div className="gallery-grid">
          {media.map((item) => (
            <div key={item.id} className="gallery-item">
              {item.type === 'photo' ? (
                <img src={item.url} alt="Media" className="gallery-image" />
              ) : (
                <video src={item.url} className="gallery-image" controls />
              )}
              <button
                className="gallery-delete-btn"
                onClick={() => handleDelete(item.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
