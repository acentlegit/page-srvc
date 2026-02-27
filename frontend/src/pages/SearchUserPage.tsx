import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { usersApi, User } from '../api/apiClient'

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  status: string
  phone: string
}

export default function SearchUserPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<UserRow[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])

  // No initial fetch - users are loaded via search API only

  // Search users using Swagger API
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setRows([])
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Searching for users with query:', searchQuery)
      
      // Use Swagger search API (with localStorage fallback)
      const results = await usersApi.search(searchQuery.trim())
      
      console.log('✅ Search results:', results.length, 'users found')
      
      // Store results for view/edit/delete
      setAllUsers(results)

      const mappedRows: UserRow[] = results.map((user: User) => ({
        id: user.id || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'N/A',
        email: user.email || '',
        role: user.role || 'N/A',
        status: user.status || (user.blocked === 'OFF' ? 'active' : 'inactive') || 'N/A',
        phone: user.phone || 'N/A',
      }))

      setRows(mappedRows)
      
      if (results.length === 0) {
        setError(null) // Don't show error, just show "no results" message
      }
    } catch (err: any) {
      console.error('Failed to search users:', err)
      // Don't show error if it's a 404 (expected for staging backend)
      const is404Error = err.status === 404 || err.message?.includes('404')
      if (!is404Error) {
        setError(err.message || 'Failed to search users')
      } else {
        // Try localStorage search as fallback
        try {
          const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]') as User[]
          const queryLower = searchQuery.trim().toLowerCase()
          
          const matchingUsers = storedUsers.filter((user: User) => {
            const firstName = (user.firstName || '').toLowerCase()
            const lastName = (user.lastName || '').toLowerCase()
            const email = (user.email || '').toLowerCase()
            const phone = (user.phone || '').toLowerCase()
            const role = (user.role || '').toLowerCase()
            
            return firstName.includes(queryLower) ||
                   lastName.includes(queryLower) ||
                   email.includes(queryLower) ||
                   phone.includes(queryLower) ||
                   role.includes(queryLower) ||
                   `${firstName} ${lastName}`.trim().includes(queryLower)
          })
          
          setAllUsers(matchingUsers)
          const mappedRows: UserRow[] = matchingUsers.map((user: User) => ({
            id: user.id || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'N/A',
            email: user.email || '',
            role: user.role || 'N/A',
            status: user.status || (user.blocked === 'OFF' ? 'active' : 'inactive') || 'N/A',
            phone: user.phone || 'N/A',
          }))
          setRows(mappedRows)
          setError(null)
        } catch (localErr) {
          setError('No users found. Try creating a user first.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'phone', label: 'Phone' },
  ] as const

  const handleView = (row: UserRow) => {
    const user = allUsers.find(u => u.id === row.id)
    if (user) {
      window.alert(
        `User Details:\n\n` +
        `ID: ${user.id}\n` +
        `Name: ${user.firstName} ${user.lastName}\n` +
        `Email: ${user.email}\n` +
        `Phone: ${user.phone}\n` +
        `Role: ${user.role}\n` +
        `Status: ${user.status || user.blocked}\n` +
        `Beam ID: ${user.beamId || 'N/A'}\n` +
        `Custom ID: ${user.customId || 'N/A'}`
      )
    }
  }

  const handleEdit = async (row: UserRow) => {
    const newRole = window.prompt(`Update role for ${row.email}`, row.role)?.trim()
    if (!newRole || newRole === row.role) return

    try {
      const user = allUsers.find(u => u.id === row.id)
      if (user) {
        await usersApi.update(row.id, { role: newRole })
        // Refresh search results
        handleSearch()
        window.alert('User updated successfully!')
      }
    } catch (err: any) {
      console.error('Failed to update user:', err)
      window.alert(`Failed to update user: ${err.message}`)
    }
  }

  const handleDelete = async (row: UserRow) => {
    const confirmDelete = window.confirm(`Delete user ${row.email}?`)
    if (!confirmDelete) return

    try {
      await usersApi.delete(row.id)
      // Refresh search results
      handleSearch()
      window.alert('User deleted successfully!')
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      window.alert(`Failed to delete user: ${err.message}`)
    }
  }

  return (
    <div className="card">
      <PageHeader title="Search User" />

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

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          className="input"
          placeholder="Search by email, name, phone, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1 }}
        />
        <button 
          className="btn" 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            setSearchQuery('')
            setRows([])
            setError(null)
          }}
        >
          Clear
        </button>
      </div>

      {rows.length > 0 && (
        <div style={{ marginBottom: 8, color: '#777', fontSize: 14 }}>
          Found {rows.length} user(s)
        </div>
      )}

      {rows.length === 0 && !loading && searchQuery && (
        <div style={{ padding: 24, textAlign: 'center', color: '#777' }}>
          No users found matching "{searchQuery}"
        </div>
      )}

      {rows.length === 0 && !loading && !searchQuery && (
        <div style={{ padding: 24, textAlign: 'center', color: '#777' }}>
          Enter a search query and click "Search" to find users
        </div>
      )}

      {rows.length > 0 && (
        <AdminTable<UserRow>
          columns={columns as any}
          rows={rows}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
