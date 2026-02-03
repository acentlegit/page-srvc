import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { pagesApi, PageModel } from '../api/apiClient'

type PageRow = {
  originalId?: string;
  id: string
  name: string
  members: string
  lastActivity: string
  status: string
}

export default function PagesListPage() {
  const navigate = useNavigate()
  const [searchId, setSearchId] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Page Name' },
    { key: 'members', label: 'Members' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'status', label: 'Status' },
  ] as const

  const [rows, setRows] = useState<PageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch pages from REST backend
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        setError(null)
        const pages = await pagesApi.list()
        
        console.log('Fetched pages:', pages.length, 'pages');
        
        // Map PageModel[] to PageRow[]
        // Convert long timestamp IDs to simple sequential numbers for display
        const mappedRows: PageRow[] = pages.map((page: PageModel, index: number) => {
          // If ID is a long timestamp, convert to simple number (1, 2, 3...)
          // Otherwise keep the original ID
          let displayId = page.id;
          if (page.id && /^\d{13,}$/.test(page.id)) {
            // It's a timestamp, use index + 1 for display
            displayId = String(index + 1);
          }
          return {
            id: displayId, // Display simple ID
            originalId: page.id, // Keep original for API calls
            name: page.name || 'Untitled Page',
            members: `${page.members?.length || 0} users`,
            lastActivity: new Date(page.updatedAt || page.createdAt || Date.now()).toLocaleString(),
            status: 'Active',
          }
        })
        
        // Always show mapped rows (even if empty)
        setRows(mappedRows)
      } catch (err: any) {
        console.error('Failed to fetch pages:', err)
        setError(err.message || 'Failed to load pages')
        // Try to get from localStorage as last resort
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
          if (storedPages.length > 0) {
            const mappedRows: PageRow[] = storedPages.map((page: PageModel, index: number) => {
              // Use page.id if it's already a simple number, otherwise use index + 1
              let displayId = page.id;
              if (page.id && /^\d{13,}$/.test(page.id)) {
                displayId = String(index + 1);
              }
              return {
                id: displayId,
                originalId: page.id, // Keep original for API calls
                name: page.name || 'Untitled Page',
                members: `${page.members?.length || 0} users`,
                lastActivity: new Date(page.updatedAt || page.createdAt || Date.now()).toLocaleString(),
                status: 'Active',
              }
            });
            setRows(mappedRows);
            setError(null); // Clear error if we got pages from localStorage
          } else {
            setRows([]) // No default pages - show empty list
          }
        } catch (e) {
          setRows([]) // No default pages - show empty list
        }
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
    
    // Refresh list when page becomes visible (user navigates back from create page)
    const handleFocus = () => {
      fetchPages()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const filteredRows = useMemo(() => {
    const query = searchId.trim().toLowerCase()
    return rows.filter((row) => {
      // Search by ID or name
      const searchMatch = query 
        ? row.id.toLowerCase().includes(query) || row.name.toLowerCase().includes(query)
        : true
      const statusMatch = statusFilter === 'All Status' ? true : row.status === statusFilter
      return searchMatch && statusMatch
    })
  }, [rows, searchId, statusFilter])

  const handleView = (row: PageRow) => {
    const pageId = row.originalId || row.id;
    navigate('/communication/pages/demo', { state: { pageId, pageName: row.name } })
  }

  const handleEdit = (row: PageRow) => {
    const pageId = row.originalId || row.id;
    navigate('/communication/pages/new', { state: { pageId, pageName: row.name } })
  }

  const handleDelete = async (row: PageRow) => {
    const shouldDelete = window.confirm(`Remove page "${row.name}" (${row.id})?`)
    if (!shouldDelete) return
    try {
      // Use originalId if available, otherwise use display id
      const pageIdToDelete = row.originalId || row.id;
      await pagesApi.delete(pageIdToDelete)
      // Remove from localStorage if it exists there
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]');
        const pageIdToDelete = row.originalId || row.id;
        const updatedPages = storedPages.filter((p: PageModel) => p.id !== pageIdToDelete);
        localStorage.setItem('localPages', JSON.stringify(updatedPages));
      } catch (e) {
        // Ignore localStorage errors
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (err: any) {
      // Even if API fails, remove from localStorage and UI
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]');
        const pageIdToDelete = row.originalId || row.id;
        const updatedPages = storedPages.filter((p: PageModel) => p.id !== pageIdToDelete);
        localStorage.setItem('localPages', JSON.stringify(updatedPages));
      } catch (e) {
        // Ignore localStorage errors
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id))
    }
  }

  return (
    <div className="card">
      <PageHeader
        title="Pages"
        right={
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/communication/pages/new')}>
              Create Page
            </button>
          </div>
        }
      />

      {loading && <div style={{ padding: 16, textAlign: 'center' }}>Loading pages...</div>}
      {error && (
        <div style={{ padding: 16, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search by ID or Name"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Archived</option>
        </select>
      </div>

      <AdminTable<PageRow>
        columns={columns as any}
        rows={filteredRows}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
