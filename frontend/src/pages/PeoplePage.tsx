import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Legend from '../components/Legend'
import AdminTable from '../components/AdminTable'
import { usersApi, User } from '../api/apiClient'

type PeopleRow = {
  id?: string
  flag: string
  blocked: string
  firstName: string
  lastName: string
  customId: string
  role: string
  phone: string
  email: string
  beamId: string
  status: string
}

export default function PeoplePage() {
  const legend = [
    { label: 'online', color: 'limegreen' },
    { label: 'enroute', color: 'dodgerblue' },
    { label: 'away', color: 'orange' },
    { label: 'offline', color: 'gray' },
    { label: 'busy', color: 'red' },
    { label: 'escalated', color: 'purple' },
  ]

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('Sort by Role')
  const [action, setAction] = useState('Action')
  const [statusDraft, setStatusDraft] = useState<Set<string>>(new Set())
  const [statusApplied, setStatusApplied] = useState<Set<string>>(new Set())

  const columns = [
    { key: 'flag', label: 'Flag' },
    { key: 'blocked', label: 'Blocked' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'customId', label: 'Custom ID' },
    { key: 'role', label: 'Role' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'beamId', label: 'Beam Id' },
  ] as const

  const [rows, setRows] = useState<PeopleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch users from REST API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch from REST API
        const users = await usersApi.list()
        
        // Map backend response to PeopleRow format
        const mappedRows: PeopleRow[] = users.map((user: User) => ({
          id: user.id,
          flag: user.flag || '',
          blocked: user.blocked || 'OFF',
          firstName: user.firstName,
          lastName: user.lastName,
          customId: user.customId,
          role: user.role,
          phone: user.phone,
          email: user.email,
          beamId: user.beamId,
          status: user.status || 'offline',
        }))
        
        setRows(mappedRows)
      } catch (err: any) {
        console.error('Failed to fetch users:', err)
        setError(err.message || 'Failed to load users from backend')
        setRows([]) // No default data - show empty list
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const statusFilter = statusApplied.size ? statusApplied : null
    let list = rows.filter((row) => {
      const matchesQuery = [row.firstName, row.lastName, row.email, row.role, row.customId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
      const matchesStatus = statusFilter ? statusFilter.has(row.status) : true
      return matchesQuery && matchesStatus
    })

    if (sortBy === 'Sort by Name') {
      list = [...list].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      )
    } else if (sortBy === 'Sort by Role') {
      list = [...list].sort((a, b) => a.role.localeCompare(b.role))
    }
    return list
  }, [rows, search, statusApplied, sortBy])

  const addPerson = async () => {
    const firstName = window.prompt('First name', '')
    if (!firstName) return
    const lastName = window.prompt('Last name', '') ?? ''
    const email = window.prompt('Email', '') ?? ''
    const role = window.prompt('Role', 'member') ?? 'member'
    const status = window.prompt('Status', 'online') ?? 'online'
    
    const newUser = {
      firstName,
      lastName,
      email,
      role,
      phone: 'N/A',
      beamId: `${firstName}.${lastName}`.toLowerCase(),
    }
    
    try {
      // Create user via REST API
      const created = await usersApi.create({
        blocked: 'OFF',
        firstName,
        lastName,
        customId: `custom-${Date.now()}`,
        role,
        phone: 'N/A',
        email,
        beamId: newUser.beamId,
        status,
      })
      const newRow: PeopleRow = {
        id: created.id,
        flag: created.flag || '',
        blocked: created.blocked,
        firstName: created.firstName,
        lastName: created.lastName,
        customId: created.customId,
        role: created.role,
        phone: created.phone,
        email: created.email,
        beamId: created.beamId,
        status: created.status || 'offline',
      }
      setRows((prev) => [newRow, ...prev])
    } catch (err: any) {
      console.error('Failed to create user:', err)
      window.alert('Failed to create user: ' + (err.message || 'Unknown error'))
    }
  }

  const handleView = (row: PeopleRow) => {
    window.alert(
      `Name: ${row.firstName} ${row.lastName}\nRole: ${row.role}\nEmail: ${row.email}\nBeam ID: ${row.beamId}`,
    )
  }

  const handleEdit = async (row: PeopleRow) => {
    const nextRole = window.prompt(`Update role for ${row.firstName}`, row.role)
    if (!nextRole) return
    
    try {
      if (row.id) {
        const updated = await usersApi.update(row.id, { role: nextRole })
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, role: updated.role } : r)))
      } else {
        window.alert('Cannot update: User ID not found')
      }
    } catch (err: any) {
      console.error('Failed to update user:', err)
      window.alert('Failed to update user: ' + (err.message || 'Unknown error'))
    }
  }

  const handleDelete = async (row: PeopleRow) => {
    const confirmed = window.confirm(`Remove ${row.firstName} ${row.lastName}?`)
    if (!confirmed) return
    
    try {
      if (row.id) {
        await usersApi.delete(row.id)
        setRows((prev) => prev.filter((r) => r.id !== row.id))
      } else {
        window.alert('Cannot delete: User ID not found')
      }
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      window.alert('Failed to delete user: ' + (err.message || 'Unknown error'))
    }
  }

  const toggleStatus = (label: string) => {
    setStatusDraft((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const applyStatusFilter = () => {
    setStatusApplied(new Set(statusDraft))
  }

  const submitAction = () => {
    if (action === 'Delete') {
      const confirmed = window.confirm('Delete all filtered people?')
      if (!confirmed) return
      const filteredIds = new Set(filteredRows.map((row) => row.customId))
      setRows((prev) => prev.filter((row) => !filteredIds.has(row.customId)))
      return
    }
    if (action === 'Export') {
      const header = columns.map((c) => c.label).join(',')
      const lines = filteredRows.map((row) =>
        [
          row.flag,
          row.blocked,
          row.firstName,
          row.lastName,
          row.customId,
          row.role,
          row.phone,
          row.email,
          row.beamId,
        ]
          .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
          .join(','),
      )
      const csv = [header, ...lines].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'people-export.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      return
    }
    window.alert('Select an action to continue.')
  }

  return (
    <div className="card">
      <PageHeader title="People" right={<button className="btn btn-secondary" onClick={addPerson}>Add</button>} />

      {loading && <div style={{ padding: 16, textAlign: 'center' }}>Loading users...</div>}
      {error && (
        <div style={{ padding: 16, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input
              className="input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option>Sort by Role</option>
              <option>Sort by Name</option>
            </select>
            <select className="select" value={action} onChange={(e) => setAction(e.target.value)}>
              <option>Action</option>
              <option>Export</option>
              <option>Delete</option>
            </select>
            <button
              style={{ background: action === 'Action' ? '#ccc' : undefined }}
              className="btn"
              onClick={submitAction}
              disabled={action === 'Action'}
            >
              Submit
            </button>
          </div>

          <AdminTable<PeopleRow>
            columns={columns as any}
            rows={filteredRows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </div>

        <div>
          <Legend items={legend} selectedLabels={statusDraft} onToggle={toggleStatus} />
          <button className="btn btn-secondary" style={{ marginTop: 16, width: '100%' }} onClick={applyStatusFilter}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}