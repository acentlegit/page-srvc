import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { usersApi } from '../api/apiClient'

type PendingUser = {
  email: string
  role: string
  source: string
  id?: string // User ID if created successfully
}

export default function BulkUsersPage() {
  const [emails, setEmails] = useState('')
  const [defaultRole, setDefaultRole] = useState('member')
  const [rows, setRows] = useState<PendingUser[]>([])

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'source', label: 'Source' },
  ] as const

  const normalizeEmail = (value: string) => value.trim().toLowerCase()

  const addRows = (newRows: PendingUser[]) => {
    if (!newRows.length) return
    setRows((prev) => {
      const existing = new Set(prev.map((r) => normalizeEmail(r.email)))
      const filtered = newRows.filter((r) => !existing.has(normalizeEmail(r.email)))
      return [...filtered, ...prev]
    })
  }

  const handleRegister = async () => {
    const list = emails
      .split(/[\n,;]+/)
      .map((entry) => normalizeEmail(entry))
      .filter(Boolean)

    if (!list.length) {
      window.alert('Please enter at least one email.')
      return
    }

    try {
      // Create users via API (uses Swagger format if endpoint is /createUser)
      const promises = list.map(async (email) => {
        const [firstName, lastName] = email.split('@')[0].split('.')
        const userData = {
          email,
          firstName: firstName || email.split('@')[0],
          lastName: lastName || '',
          role: defaultRole,
          blocked: 'OFF',
          phone: 'N/A',
          beamId: email.split('@')[0],
          customId: `custom-${Date.now()}-${Math.random()}`,
          status: 'active',
        }
        
        try {
          const created = await usersApi.create(userData)
          return {
            email,
            role: defaultRole,
            source: 'Manual paste',
            id: created.id || created.userId, // Handle both Swagger and standard response
          }
        } catch (err) {
          console.error(`Failed to create user ${email}:`, err)
          // Still add to list even if API fails
          return {
            email,
            role: defaultRole,
            source: 'Manual paste (failed)',
          }
        }
      })

      const results = await Promise.all(promises)
      addRows(results)
      setEmails('')
      window.alert(`Registered ${results.length} user(s)`)
    } catch (err) {
      console.error('Failed to register users:', err)
      window.alert('Failed to register users. Check console for details.')
    }
  }

  const parseCsv = (content: string) => {
    const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    if (!lines.length) return []
    const first = lines[0].toLowerCase()
    const hasHeader = first.includes('email')
    const dataLines = hasHeader ? lines.slice(1) : lines

    return dataLines
      .map((line) => line.split(',').map((cell) => cell.trim()))
      .filter((cells) => cells[0])
      .map(([email, role]) => ({
        email: normalizeEmail(email),
        role: role || defaultRole,
        source: 'CSV upload',
      }))
  }

  const handleCsvUpload = async (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const content = typeof reader.result === 'string' ? reader.result : ''
      const parsed = parseCsv(content)
      
      // Create users via API
      try {
        const promises = parsed.map(async (user) => {
          const [firstName, lastName] = user.email.split('@')[0].split('.')
          const userData = {
            email: user.email,
            firstName: firstName || user.email.split('@')[0],
            lastName: lastName || '',
            role: user.role,
            blocked: 'OFF',
            phone: 'N/A',
            beamId: user.email.split('@')[0],
            customId: `custom-${Date.now()}-${Math.random()}`,
            status: 'active',
          }
          
          try {
            const created = await usersApi.create(userData)
            return {
              ...user,
              id: created.id || created.userId, // Handle both Swagger and standard response
            }
          } catch (err) {
            console.error(`Failed to create user ${user.email}:`, err)
            return { ...user, source: 'CSV upload (failed)' }
          }
        })

        const results = await Promise.all(promises)
        addRows(results)
        window.alert(`Registered ${results.length} user(s) from CSV`)
      } catch (err) {
        console.error('Failed to register users from CSV:', err)
        window.alert('Failed to register users from CSV. Check console for details.')
      }
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csv = 'email,role\nuser1@company.com,member\nuser2@company.com,admin\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'user-import-template.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleEdit = async (row: PendingUser) => {
    const nextRole = window.prompt(`Update role for ${row.email}`, row.role)?.trim()
    if (!nextRole || nextRole === row.role) return
    
    try {
      // If user has an ID, try to update via API
      if (row.id) {
        await usersApi.update(row.id, { role: nextRole })
        // Also update in localStorage if user exists there
        try {
          const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
          const userIndex = storedUsers.findIndex((u: any) => u.id === row.id || u.email === row.email);
          if (userIndex >= 0) {
            storedUsers[userIndex].role = nextRole;
            localStorage.setItem('localUsers', JSON.stringify(storedUsers));
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      // Update UI
      setRows((prev) => prev.map((r) => (r.email === row.email ? { ...r, role: nextRole } : r)))
      window.alert(`Role updated to "${nextRole}" for ${row.email}`)
    } catch (err: any) {
      console.error('Failed to update user role:', err)
      // Even if API fails, update UI and localStorage
      try {
        const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const userIndex = storedUsers.findIndex((u: any) => u.id === row.id || u.email === row.email);
        if (userIndex >= 0) {
          storedUsers[userIndex].role = nextRole;
          localStorage.setItem('localUsers', JSON.stringify(storedUsers));
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      setRows((prev) => prev.map((r) => (r.email === row.email ? { ...r, role: nextRole } : r)))
      window.alert(`Role updated to "${nextRole}" for ${row.email} (stored locally)`)
    }
  }

  const handleDelete = async (row: PendingUser) => {
    const confirmDelete = window.confirm(`Remove ${row.email} from the list?`)
    if (!confirmDelete) return
    
    try {
      // If user has an ID, try to delete via API
      if (row.id) {
        await usersApi.delete(row.id)
        // Also remove from localStorage if user exists there
        try {
          const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
          const updatedUsers = storedUsers.filter((u: any) => u.id !== row.id && u.email !== row.email);
          localStorage.setItem('localUsers', JSON.stringify(updatedUsers));
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      // Remove from UI
      setRows((prev) => prev.filter((r) => r.email !== row.email))
      window.alert(`${row.email} removed successfully`)
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      // Even if API fails, remove from localStorage and UI
      try {
        const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const updatedUsers = storedUsers.filter((u: any) => u.id !== row.id && u.email !== row.email);
        localStorage.setItem('localUsers', JSON.stringify(updatedUsers));
      } catch (e) {
        // Ignore localStorage errors
      }
      setRows((prev) => prev.filter((r) => r.email !== row.email))
      window.alert(`${row.email} removed from list (removed from local storage)`)
    }
  }

  const handleView = async (row: PendingUser) => {
    // Try to fetch full user details if ID exists
    if (row.id) {
      try {
        const user = await usersApi.get(row.id)
        window.alert(
          `User Details:\n\n` +
          `ID: ${user.id}\n` +
          `Email: ${user.email}\n` +
          `Name: ${user.firstName} ${user.lastName}\n` +
          `Role: ${user.role}\n` +
          `Phone: ${user.phone || 'N/A'}\n` +
          `Status: ${user.status || user.blocked || 'N/A'}\n` +
          `Beam ID: ${user.beamId || 'N/A'}\n` +
          `Custom ID: ${user.customId || 'N/A'}\n` +
          `Source: ${row.source}`
        )
        return
      } catch (err: any) {
        console.error('Failed to fetch user details:', err)
        // Fall through to show basic info
      }
    }
    
    // Show basic info from row
    window.alert(
      `User Information:\n\n` +
      `Email: ${row.email}\n` +
      `Role: ${row.role}\n` +
      `Source: ${row.source}\n` +
      `${row.id ? `ID: ${row.id}` : '(Not yet registered)'}`
    )
  }

  return (
    <div className="card">
      <PageHeader title="Bulk User Registration" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div className="small-label">Upload CSV</div>
          <input
            type="file"
            className="input"
            accept=".csv"
            onChange={(e) => handleCsvUpload(e.target.files?.[0] ?? null)}
          />
          <div style={{ fontSize: 12, color: '#777', marginTop: 6 }}>
            CSV should include: email, role
          </div>
        </div>
        <div>
          <div className="small-label">Default Role</div>
          <select className="select" value={defaultRole} onChange={(e) => setDefaultRole(e.target.value)}>
            <option>member</option>
            <option>manager</option>
            <option>admin</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="small-label">Paste Emails (one per line)</div>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="user1@company.com&#10;user2@company.com"
          style={{
            width: '100%',
            minHeight: 110,
            padding: 10,
            borderRadius: 6,
            border: '1px solid #ddd',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button className="btn" onClick={handleRegister}>
          Register Users
        </button>
        <button className="btn btn-secondary" onClick={downloadTemplate}>
          Download Template
        </button>
      </div>

      <AdminTable<PendingUser>
        columns={columns as any}
        rows={rows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </div>
  )
}
