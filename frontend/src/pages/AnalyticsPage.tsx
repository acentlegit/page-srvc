import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { pagesApi, PageModel } from '../api/apiClient'

type PageUsageRow = {
  id: string
  pageId: string
  name: string
  members: string
  users: string
}

export default function AnalyticsPage() {
  const [pages, setPages] = useState<PageModel[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch pages from API
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        const fetchedPages = await pagesApi.list()
        setPages(fetchedPages)
      } catch (err: any) {
        console.error('Failed to fetch pages:', err)
        setPages([])
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  }, [])

  const totalPages = pages.length
  const totalUsers = useMemo(() => {
    const set = new Set<string>()
    pages.forEach((page) => {
      const members = page.members || []
      if (Array.isArray(members)) {
        members.forEach((member: any) => {
          const userId = typeof member === 'string' ? member : member.userId || member.email || ''
          if (userId) {
            set.add(userId)
          }
        })
      }
    })
    return set.size
  }, [pages])

  const columns = [
    { key: 'pageId', label: 'Page ID' },
    { key: 'name', label: 'Page Name' },
    { key: 'members', label: 'Members' },
    { key: 'users', label: 'Users' },
  ] as const

  // Get display ID mapping (simple sequential numbers)
  const getDisplayId = (pageId: string, index: number): string => {
    // If ID is already a simple number, use it
    if (pageId && /^\d+$/.test(pageId) && pageId.length <= 4) {
      return pageId
    }
    // Otherwise use index + 1
    return String(index + 1)
  }

  const rows: PageUsageRow[] = pages.map((page, index) => {
    const members = page.members || []
    const memberList = Array.isArray(members) 
      ? members.map((m: any) => typeof m === 'string' ? m : m.userId || m.email || '').filter(Boolean)
      : []
    
    return {
      id: page.id || '',
      pageId: getDisplayId(String(page.id || ''), index),
      name: page.name || 'Untitled Page',
      members: `${members.length} member${members.length !== 1 ? 's' : ''}`,
      users: memberList.join(', ') || '',
    }
  })

  const handleEdit = async (row: PageUsageRow) => {
    const newName = window.prompt('Edit page name', row.name)
    if (!newName || newName === row.name || !row.id) return

    try {
      await pagesApi.update(row.id, { name: newName })
      // Refresh pages
      const fetchedPages = await pagesApi.list()
      setPages(fetchedPages)
    } catch (err: any) {
      console.error('Failed to update page:', err)
      window.alert('Failed to update page: ' + (err.message || 'Unknown error'))
    }
  }

  const handleDelete = async (row: PageUsageRow) => {
    const confirmed = window.confirm(`Delete page "${row.name}"?`)
    if (!confirmed || !row.id) return

    try {
      await pagesApi.delete(row.id)
      // Refresh pages
      const fetchedPages = await pagesApi.list()
      setPages(fetchedPages)
    } catch (err: any) {
      console.error('Failed to delete page:', err)
      window.alert('Failed to delete page: ' + (err.message || 'Unknown error'))
    }
  }

  const handleView = async (row: PageUsageRow) => {
    if (!row.id) {
      window.alert(`Page: ${row.name}\nMembers: ${row.members}\nUsers: ${row.users || 'None'}`)
      return
    }

    try {
      const page = await pagesApi.get(row.id)
      const members = page.members || []
      const memberList = Array.isArray(members)
        ? members.map((m: any) => typeof m === 'string' ? m : m.userId || m.email || '').filter(Boolean)
        : []
      
      window.alert(
        `Page Details:\n\n` +
        `ID: ${row.pageId}\n` +
        `Name: ${page.name || row.name}\n` +
        `Type: ${page.type || 'LiveGroup'}\n` +
        `Members: ${members.length}\n` +
        `Users: ${memberList.join(', ') || 'None'}\n` +
        `Created: ${page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'N/A'}`
      )
    } catch (err: any) {
      console.error('Failed to fetch page details:', err)
      window.alert(
        `Page Details:\n\n` +
        `ID: ${row.pageId}\n` +
        `Name: ${row.name}\n` +
        `Members: ${row.members}\n` +
        `Users: ${row.users || 'None'}`
      )
    }
  }

  return (
    <div className="card">
      <PageHeader title="Analytics" />

      {loading && <div style={{ padding: 16, textAlign: 'center' }}>Loading analytics...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 20, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e6e6e6' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Total Pages</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#333' }}>
            {loading ? '...' : totalPages}
          </div>
        </div>
        <div style={{ padding: 20, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e6e6e6' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Total Users in Pages</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#333' }}>
            {loading ? '...' : totalUsers}
          </div>
        </div>
      </div>

      {rows.length === 0 && !loading && (
        <div style={{ padding: 16, textAlign: 'center', color: '#777' }}>
          No pages found. Create your first page!
        </div>
      )}

      {rows.length > 0 && (
        <AdminTable<PageUsageRow>
          columns={columns as any}
          rows={rows}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}
    </div>
  )
}
