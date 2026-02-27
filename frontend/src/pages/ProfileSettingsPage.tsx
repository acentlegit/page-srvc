import React, { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { usersApi } from '../api/apiClient'

export default function ProfileSettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState('manager')
  const [department, setDepartment] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [bio, setBio] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load current user profile from localStorage or prompt for user ID
  useEffect(() => {
    // Try to get current user from localStorage
    const currentUserId = localStorage.getItem('currentUserId')
    if (currentUserId) {
      setUserId(currentUserId)
      loadProfile(currentUserId)
    } else {
      // Prompt for user ID if not set
      const id = window.prompt('Enter your User ID to load profile:')
      if (id) {
        setUserId(id)
        localStorage.setItem('currentUserId', id)
        loadProfile(id)
      } else {
        // Load from localStorage profile data if exists
        loadProfileFromLocalStorage()
      }
    }
  }, [])

  const loadProfile = async (id: string) => {
    try {
      const user = await usersApi.get(id)
      setDisplayName(`${user.firstName} ${user.lastName}`.trim() || '')
      setRole(user.role || 'manager')
      setDepartment(user.department || '')
      setTimezone(user.timezone || 'UTC')
      setBio(user.bio || '')
      // Store in localStorage for fallback
      localStorage.setItem('profileData', JSON.stringify({
        displayName: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        department: user.department,
        timezone: user.timezone,
        bio: user.bio
      }))
    } catch (err: any) {
      console.error('Failed to load profile:', err)
      // Fallback to localStorage
      loadProfileFromLocalStorage()
    }
  }

  const loadProfileFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('profileData')
      if (saved) {
        const data = JSON.parse(saved)
        setDisplayName(data.displayName || '')
        setRole(data.role || 'manager')
        setDepartment(data.department || '')
        setTimezone(data.timezone || 'UTC')
        setBio(data.bio || '')
      }
    } catch (e) {
      console.warn('Failed to load profile from localStorage:', e)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a display name' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // If we have a userId, update via API
      if (userId) {
        const [firstName, ...lastNameParts] = displayName.trim().split(' ')
        const lastName = lastNameParts.join(' ') || ''
        
        const updateData: any = {
          firstName: firstName || displayName,
          lastName: lastName,
          role: role,
          department: department,
          timezone: timezone,
          bio: bio
        }

        await usersApi.update(userId, updateData)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        // No userId - just save to localStorage
        const profileData = {
          displayName,
          role,
          department,
          timezone,
          bio
        }
        localStorage.setItem('profileData', JSON.stringify(profileData))
        setMessage({ type: 'success', text: 'Profile saved locally! (No user ID set - enter User ID to sync with backend)' })
      }

      // Save profile photo to localStorage if selected
      if (profilePhoto) {
        // Convert to base64 and store
        const reader = new FileReader()
        reader.onloadend = () => {
          localStorage.setItem('profilePhoto', reader.result as string)
        }
        reader.readAsDataURL(profilePhoto)
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      console.error('Failed to save profile:', err)
      // Even if API fails, save to localStorage
      const profileData = {
        displayName,
        role,
        department,
        timezone,
        bio
      }
      localStorage.setItem('profileData', JSON.stringify(profileData))
      setMessage({ type: 'error', text: 'Failed to save profile to backend, but saved locally. Error: ' + (err.message || 'Unknown error') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <PageHeader title="Profile Settings" />

      {message && (
        <div style={{
          padding: 12,
          marginBottom: 16,
          borderRadius: 6,
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          color: message.type === 'success' ? '#155724' : '#721c24'
        }}>
          {message.text}
        </div>
      )}

      {userId && (
        <div style={{ marginBottom: 16, padding: 8, background: '#e7f3ff', borderRadius: 4, fontSize: 12 }}>
          Editing profile for User ID: <strong>{userId}</strong>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div className="small-label">Display Name</div>
          <input
            className="input"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <div className="small-label">Role</div>
          <select
            className="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>admin</option>
            <option>manager</option>
            <option>dispatcher</option>
            <option>member</option>
          </select>
        </div>
        <div>
          <div className="small-label">Department</div>
          <input
            className="input"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div>
          <div className="small-label">Timezone</div>
          <select
            className="select"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            <option>UTC</option>
            <option>PST</option>
            <option>EST</option>
            <option>IST</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="small-label">Bio</div>
          <textarea
            className="input"
            placeholder="Short profile bio"
            style={{ minHeight: 90 }}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="small-label">Profile Photo</div>
          <input
            type="file"
            className="input"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {profilePhotoPreview && (
            <div style={{ marginTop: 12 }}>
              <img
                src={profilePhotoPreview}
                alt="Profile preview"
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          className="btn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {!userId && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              const id = window.prompt('Enter User ID to link this profile:')
              if (id) {
                setUserId(id)
                localStorage.setItem('currentUserId', id)
                loadProfile(id)
              }
            }}
          >
            Link User ID
          </button>
        )}
      </div>
    </div>
  )
}
