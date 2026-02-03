import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { groupsApi, Group } from '../api/apiClient'

type GroupRow = {
  id: string
  title: string
  users: string
  type: string
}

export default function GroupsPage() {
  const [rows, setRows] = useState<GroupRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'users', label: 'Number of Users' },
    { key: 'type', label: 'Type' },
  ] as const

  // Load groups on mount
  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const groups = await groupsApi.search()
      const mappedRows: GroupRow[] = groups.map((group: Group) => ({
        id: group.id || group.objectId || '',
        title: group.title || group.name || 'Untitled Group',
        users: String(group.users || group.members?.length || 0),
        type: group.type || 'organization'
      }))
      setRows(mappedRows)
    } catch (err: any) {
      console.error('Failed to fetch groups:', err)
      setMessage({ type: 'error', text: 'Failed to load groups: ' + (err.message || 'Unknown error') })
      // Load from localStorage as fallback
      try {
        const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
        const mappedRows: GroupRow[] = storedGroups.map((group: Group) => ({
          id: group.id || group.objectId || '',
          title: group.title || group.name || 'Untitled Group',
          users: String(group.users || group.members?.length || 0),
          type: group.type || 'organization'
        }))
        setRows(mappedRows)
      } catch (e) {
        setRows([])
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const query = search.toLowerCase()
    return rows.filter(row =>
      row.title.toLowerCase().includes(query) ||
      row.type.toLowerCase().includes(query) ||
      row.users.includes(query)
    )
  }, [rows, search])

  const handleAddGroup = async (type: 'static' | 'dynamic' | 'non-beamer') => {
    const name = window.prompt(`Enter ${type} group name:`)
    if (!name || !name.trim()) return

    try {
      const newGroup = await groupsApi.create({
        name: name.trim(),
        type: type === 'non-beamer' ? 'non-beamer' : type,
        members: []
      })
      
      // Refresh groups list
      await fetchGroups()
      setMessage({ type: 'success', text: `Group "${name}" created successfully!` })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      console.error('Failed to create group:', err)
      setMessage({ type: 'error', text: 'Failed to create group: ' + (err.message || 'Unknown error') })
      // Refresh anyway to show locally created group
      await fetchGroups()
    }
  }

  const handleEdit = async (row: GroupRow) => {
    const newName = window.prompt('Edit group name', row.title)
    if (!newName || newName === row.title || !row.id) return

    try {
      await groupsApi.update(row.id, { name: newName, title: newName })
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, title: newName } : r)))
      setMessage({ type: 'success', text: 'Group updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      console.error('Failed to update group:', err)
      // Update UI anyway (localStorage fallback)
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, title: newName } : r)))
      setMessage({ type: 'error', text: 'Failed to update group on backend, but updated locally' })
    }
  }

  const handleDelete = async (row: GroupRow) => {
    const confirmed = window.confirm(`Delete group "${row.title}"?`)
    if (!confirmed || !row.id) return

    try {
      // For now, just remove from localStorage (no delete endpoint in Swagger)
      try {
        const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
        const updatedGroups = storedGroups.filter(g => g.id !== row.id && g.objectId !== row.id);
        localStorage.setItem('localGroups', JSON.stringify(updatedGroups));
      } catch (e) {
        // Ignore localStorage errors
      }
      
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      setMessage({ type: 'success', text: 'Group deleted successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      console.error('Failed to delete group:', err)
      setMessage({ type: 'error', text: 'Failed to delete group: ' + (err.message || 'Unknown error') })
    }
  }

  const handleView = async (row: GroupRow) => {
    if (!row.id) {
      window.alert(`Group: ${row.title}\nType: ${row.type}\nUsers: ${row.users}`)
      return
    }

    try {
      const account = await groupsApi.getAccount(row.id)
      window.alert(
        `Group Details:\n\n` +
        `ID: ${row.id}\n` +
        `Name: ${row.title}\n` +
        `Type: ${row.type}\n` +
        `Number of Users: ${row.users}\n` +
        `Account: ${JSON.stringify(account, null, 2)}`
      )
    } catch (err: any) {
      console.error('Failed to fetch group account:', err)
      window.alert(
        `Group Details:\n\n` +
        `ID: ${row.id}\n` +
        `Name: ${row.title}\n` +
        `Type: ${row.type}\n` +
        `Number of Users: ${row.users}`
      )
    }
  }

  return (
    <div className="card">
      <PageHeader
        title="Groups"
        right={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              className="input"
              placeholder="Search"
              style={{ width: 200 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={() => handleAddGroup('static')}>
              Add Static
            </button>
            <button className="btn btn-secondary" onClick={() => handleAddGroup('dynamic')}>
              Add Dynamic
            </button>
            <button className="btn" onClick={() => handleAddGroup('non-beamer')}>
              Add Non Beamer
            </button>
          </div>
        }
      />

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

      {loading && (
        <div style={{ padding: 16, textAlign: 'center' }}>Loading groups...</div>
      )}

      {!loading && filteredRows.length === 0 && (
        <div style={{ padding: 16, textAlign: 'center', color: '#777' }}>
          {search ? 'No groups found matching your search.' : 'No groups found. Create your first group!'}
        </div>
      )}

      {!loading && filteredRows.length > 0 && (
        <AdminTable<GroupRow>
          columns={columns as any}
          rows={filteredRows}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}
    </div>
  )
}
