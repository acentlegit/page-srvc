import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { usersApi, User } from '../api/apiClient'

type OrgPosition = {
  id: string
  title: string
  department?: string
  managerId?: string
  people: string[] // Array of user IDs
  level: number // Hierarchy level (0 = CEO, 1 = VP, etc.)
}

type OrgRow = {
  title: string
  people: string
  department?: string
  level: number
}

export default function OrgChartPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [positions, setPositions] = useState<OrgPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPosition, setEditingPosition] = useState<OrgPosition | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    managerId: '',
    people: [] as string[],
    level: 0,
  })

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'department', label: 'Department' },
    { key: 'people', label: 'People' },
    { key: 'level', label: 'Level' },
  ] as const

  // Load users and positions on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load users
      const userList = await usersApi.list()
      setUsers(userList)

      // Load positions from localStorage
      try {
        const storedPositions = JSON.parse(localStorage.getItem('orgPositions') || '[]') as OrgPosition[]
        setPositions(storedPositions)
      } catch (e) {
        console.warn('Failed to load positions from localStorage:', e)
        setPositions([])
      }
    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError(err.message || 'Failed to load organization data')
    } finally {
      setLoading(false)
    }
  }

  // Convert positions to table rows
  const rows: OrgRow[] = useMemo(() => {
    return positions.map((pos) => {
      const peopleNames = pos.people
        .map((userId) => {
          const user = users.find((u) => u.id === userId)
          return user ? `${user.firstName} ${user.lastName}`.trim() || user.email : userId
        })
        .filter(Boolean)
        .join(', ')

      return {
        title: pos.title,
        department: pos.department || '',
        people: peopleNames || 'No one assigned',
        level: pos.level,
      }
    })
  }, [positions, users])

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const query = search.toLowerCase()
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(query) ||
        row.department?.toLowerCase().includes(query) ||
        row.people.toLowerCase().includes(query),
    )
  }, [rows, search])

  // Save positions to localStorage
  const savePositions = (newPositions: OrgPosition[]) => {
    try {
      localStorage.setItem('orgPositions', JSON.stringify(newPositions))
      setPositions(newPositions)
    } catch (e) {
      console.error('Failed to save positions:', e)
      setError('Failed to save organization structure')
    }
  }

  // Add or update position
  const handleSavePosition = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    const newPositions = [...positions]

    if (editingPosition) {
      // Update existing
      const index = newPositions.findIndex((p) => p.id === editingPosition.id)
      if (index >= 0) {
        newPositions[index] = {
          ...editingPosition,
          title: formData.title,
          department: formData.department,
          managerId: formData.managerId || undefined,
          people: formData.people,
          level: formData.level,
        }
      }
    } else {
      // Add new
      const newPosition: OrgPosition = {
        id: String(Date.now()),
        title: formData.title,
        department: formData.department || undefined,
        managerId: formData.managerId || undefined,
        people: formData.people,
        level: formData.level,
      }
      newPositions.push(newPosition)
    }

    savePositions(newPositions)
    setShowAddDialog(false)
    setEditingPosition(null)
    setFormData({
      title: '',
      department: '',
      managerId: '',
      people: [],
      level: 0,
    })
    setError(null)
  }

  // Delete position
  const handleDeletePosition = (id: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      const newPositions = positions.filter((p) => p.id !== id)
      savePositions(newPositions)
    }
  }

  // Edit position
  const handleEditPosition = (position: OrgPosition) => {
    setEditingPosition(position)
    setFormData({
      title: position.title,
      department: position.department || '',
      managerId: position.managerId || '',
      people: position.people,
      level: position.level,
    })
    setShowAddDialog(true)
  }

  // Get manager name
  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'None'
    const manager = positions.find((p) => p.id === managerId)
    return manager ? manager.title : 'Unknown'
  }

  // Build hierarchy tree
  const buildHierarchy = () => {
    const rootPositions = positions.filter((p) => !p.managerId || p.level === 0)
    const childrenMap = new Map<string, OrgPosition[]>()

    positions.forEach((pos) => {
      if (pos.managerId) {
        if (!childrenMap.has(pos.managerId)) {
          childrenMap.set(pos.managerId, [])
        }
        childrenMap.get(pos.managerId)!.push(pos)
      }
    })

    return { rootPositions, childrenMap }
  }

  const { rootPositions, childrenMap } = buildHierarchy()

  // Render position card recursively
  const renderPositionCard = (position: OrgPosition, depth: number = 0) => {
    const children = childrenMap.get(position.id) || []
    const peopleNames = position.people
      .map((userId) => {
        const user = users.find((u) => u.id === userId)
        return user ? `${user.firstName} ${user.lastName}`.trim() || user.email : null
      })
      .filter(Boolean) as string[]

    return (
      <div key={position.id} style={{ marginLeft: depth * 40, marginTop: 12 }}>
        <div
          style={{
            width: 200,
            minHeight: 100,
            border: '2px solid #1976d2',
            borderRadius: 8,
            padding: 12,
            background: '#e3f2fd',
            position: 'relative',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
            {position.title}
          </div>
          {position.department && (
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
              {position.department}
            </div>
          )}
          {peopleNames.length > 0 ? (
            <div style={{ fontSize: 11, color: '#333', marginTop: 8 }}>
              {peopleNames.map((name, idx) => (
                <div key={idx} style={{ marginBottom: 2 }}>
                  {name}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 8 }}>
              No one assigned
            </div>
          )}
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 10, padding: '4px 8px' }}
              onClick={() => handleEditPosition(position)}
            >
              Edit
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 10, padding: '4px 8px', background: '#d32f2f', color: 'white' }}
              onClick={() => handleDeletePosition(position.id)}
            >
              Delete
            </button>
          </div>
        </div>
        {children.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {children.map((child) => renderPositionCard(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      <PageHeader
        title="Organization Chart"
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="input"
              style={{ width: 220 }}
              placeholder="Search positions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingPosition(null)
                setFormData({
                  title: '',
                  department: '',
                  managerId: '',
                  people: [],
                  level: 0,
                })
                setShowAddDialog(true)
              }}
            >
              Add Position
            </button>
          </div>
        }
      />

      {error && (
        <div style={{ padding: 12, background: '#ffebee', color: '#c62828', borderRadius: 4, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center' }}>Loading organization data...</div>
      ) : (
        <>
          <AdminTable<OrgRow> columns={columns as any} rows={filteredRows} />

          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Visual Organization Chart</h3>
            {rootPositions.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                No positions defined. Click "Add Position" to create the organization structure.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {rootPositions.map((pos) => renderPositionCard(pos))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      {showAddDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddDialog(false)}
        >
          <div
            className="card"
            style={{ width: 500, maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 16 }}>
              {editingPosition ? 'Edit Position' : 'Add Position'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                  Title <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., CEO, VP Engineering"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                  Department
                </label>
                <input
                  className="input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Engineering, Sales"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                  Manager (Reports To)
                </label>
                <select
                  className="select"
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                >
                  <option value="">None (Top Level)</option>
                  {positions
                    .filter((p) => !editingPosition || p.id !== editingPosition.id)
                    .map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title} {pos.department ? `(${pos.department})` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                  Hierarchy Level
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  placeholder="0 = CEO, 1 = VP, etc."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                  Assign People
                </label>
                <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 4, padding: 8 }}>
                  {users.length === 0 ? (
                    <div style={{ color: '#666', fontSize: 12 }}>No users available</div>
                  ) : (
                    users.map((user) => {
                      const isSelected = formData.people.includes(user.id)
                      return (
                        <label
                          key={user.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  people: [...formData.people, user.id],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  people: formData.people.filter((id) => id !== user.id),
                                })
                              }
                            }}
                          />
                          <span style={{ fontSize: 12 }}>
                            {`${user.firstName} ${user.lastName}`.trim() || user.email} ({user.role})
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddDialog(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSavePosition}>
                {editingPosition ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
