import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { usersApi } from '../api/apiClient'

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'member',
    status: 'active',
    blocked: 'OFF',
    boarded: false, // New field for boarding status
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare user data for API
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || 'N/A',
        role: formData.role,
        blocked: formData.blocked,
        beamId: formData.email.split('@')[0] || `${formData.firstName}.${formData.lastName}`.toLowerCase(),
        customId: `custom-${Date.now()}`,
        status: formData.status,
      }

      // Create user via API (automatically handles Swagger format)
      const created = await usersApi.create(userData)
      
      // Swagger response format: { data: { userId: "..." }, status: true, message: "..." }
      // apiCall extracts the data field, so created = { userId: "..." }
      // Backend should return simple IDs like "1", "2", "3" - not timestamps
      const userId = created?.userId || created?.id
      
      // Only show userId if it's a simple number (1-9999), not a timestamp
      // Timestamps are 13 digits, simple IDs are 1-4 digits
      const isSimpleId = userId && String(userId).length <= 4 && /^\d+$/.test(String(userId))
      
      if (isSimpleId) {
        setSuccess(`User created successfully! User ID: ${userId}`)
      } else {
        // If backend returns timestamp or invalid ID, just show success message
        setSuccess('User created successfully!')
        console.warn('Backend returned non-standard userId:', userId)
      }
      
      // Log full response for debugging (with JSON stringify for better visibility)
      console.log('User created - Full response:', JSON.stringify(created, null, 2))
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'member',
        status: 'active',
        blocked: 'OFF',
        boarded: false,
      })
    } catch (err: any) {
      console.error('Failed to create user:', err)
      setError(err.message || 'Failed to create user. Please check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <PageHeader title="Create User" />

      {error && (
        <div style={{ 
          padding: 12, 
          marginBottom: 16, 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: 6,
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: 12, 
          marginBottom: 16, 
          backgroundColor: '#efe', 
          border: '1px solid #cfc',
          borderRadius: 6,
          color: '#3c3'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <div className="small-label">First Name *</div>
            <input
              type="text"
              name="firstName"
              className="input"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="John"
            />
          </div>

          <div>
            <div className="small-label">Last Name *</div>
            <input
              type="text"
              name="lastName"
              className="input"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <div className="small-label">Email *</div>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <div className="small-label">Phone</div>
            <input
              type="tel"
              name="phone"
              className="input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <div className="small-label">Role *</div>
            <select
              name="role"
              className="select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <div className="small-label">Status *</div>
            <select
              name="status"
              className="select"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <div className="small-label">Blocked *</div>
            <select
              name="blocked"
              className="select"
              value={formData.blocked}
              onChange={handleChange}
              required
            >
              <option value="OFF">OFF</option>
              <option value="ON">ON</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              setFormData({
                boarded: false,
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                role: 'member',
                status: 'active',
                blocked: 'OFF',
              })
              setError(null)
              setSuccess(null)
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
