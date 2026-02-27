import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
  const location = useLocation()
  const { user } = useAuth()
  const [searchId, setSearchId] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  
  // Check if this is customer view (URL contains /customer/)
  const isCustomerView = location.pathname.includes('/customer/')

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
  // Handle page import from URL (for cross-browser sharing)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const importData = urlParams.get('import')
    
    if (importData) {
      try {
        const importedPages = JSON.parse(atob(importData))
        if (Array.isArray(importedPages) && importedPages.length > 0) {
          console.log('📥 Importing pages from URL:', importedPages.length)
          
          // Merge with existing pages
          const existingPages = JSON.parse(localStorage.getItem('localPages') || '[]')
          const existingIds = new Set(existingPages.map((p: any) => p.id))
          
          importedPages.forEach((page: any) => {
            if (!existingIds.has(page.id)) {
              existingPages.push(page)
              existingIds.add(page.id)
            }
          })
          
          localStorage.setItem('localPages', JSON.stringify(existingPages))
          
          // Also update shared registry
          const sharedRegistry = JSON.parse(localStorage.getItem('sharedPagesRegistry') || '[]')
          const registryIds = new Set(sharedRegistry.map((p: any) => p.id))
          
          importedPages.forEach((page: any) => {
            if (!registryIds.has(page.id)) {
              sharedRegistry.push(page)
              registryIds.add(page.id)
            }
          })
          
          localStorage.setItem('sharedPagesRegistry', JSON.stringify(sharedRegistry))
          
          console.log('✅ Imported', importedPages.length, 'pages')
          
          // Remove import parameter from URL
          window.history.replaceState({}, '', window.location.pathname)
          
          // Refresh page list
          window.location.reload()
        }
      } catch (e) {
        console.error('Failed to import pages from URL:', e)
      }
    }
  }, [])
  
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        setError(null)
        const pages = await pagesApi.list()
        
        console.log('Fetched pages:', pages.length, 'pages');
        
        // Filter pages based on user role
        let filteredPages = pages
        
        // If customer view, only show pages where user is a member
        if (isCustomerView && user) {
          filteredPages = pages.filter((page: PageModel) => {
            if (!page.members || page.members.length === 0) return false
            
            // Check if current user is a member
            return page.members.some((m: any) => {
              const memberId = typeof m === 'string' ? m : (m.userId || m.id || m.email)
              // Match against user's id, email, or customerId
              return memberId === user.id || 
                     memberId === user.email ||
                     memberId === user.customerId ||
                     String(memberId).toLowerCase() === String(user.email).toLowerCase() ||
                     String(memberId).toLowerCase() === String(user.id).toLowerCase()
            })
          })
          console.log(`📋 Customer view: Filtered ${filteredPages.length} pages from ${pages.length} total pages`)
        }
        
        // Map PageModel[] to PageRow[]
        // Convert long timestamp IDs to simple sequential numbers for display
        const mappedRows: PageRow[] = filteredPages.map((page: PageModel, index: number) => {
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
        // OFFLINE MODE: Always fallback to localStorage
        console.log('ℹ️ API unavailable (offline mode), loading from localStorage...');
        
        // Try to get from localStorage as last resort
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
          
          // Also check sessionStorage for cross-tab pages
          let sessionPages: PageModel[] = [];
          try {
            sessionPages = JSON.parse(sessionStorage.getItem('sessionPages') || '[]') as PageModel[];
          } catch (e) {
            // Ignore
          }
          
          // Also check the shared pages registry for cross-browser access
          let sharedPages: PageModel[] = [];
          try {
            const sharedPagesRegistry = JSON.parse(localStorage.getItem('sharedPagesRegistry') || '[]') as PageModel[];
            if (sharedPagesRegistry.length > 0 && user?.email) {
              // Filter pages where current user is a member
              sharedPages = sharedPagesRegistry.filter((page: PageModel) => {
                if (!page.members || page.members.length === 0) return false
                return page.members.some((m: any) => {
                  const memberId = typeof m === 'string' ? m : (m.userId || m.id || m.email)
                  return memberId === user.email || 
                         memberId === user.id ||
                         String(memberId).toLowerCase() === String(user.email).toLowerCase() ||
                         String(memberId).toLowerCase() === String(user.id).toLowerCase()
                })
              })
            } else if (sharedPagesRegistry.length > 0) {
              sharedPages = sharedPagesRegistry
            }
          } catch (e) {
            // Ignore
          }
          
          // Also check member-specific storage
          let memberPages: PageModel[] = [];
          try {
            if (user?.email) {
              const memberPagesKey = `memberPages_${user.email.toLowerCase()}`;
              memberPages = JSON.parse(localStorage.getItem(memberPagesKey) || '[]') as PageModel[];
            }
          } catch (e) {
            // Ignore
          }
          
          // Merge localStorage, sessionStorage, shared pages, and member pages
          const allStoredPages = [...storedPages];
          const storedPageIds = new Set(storedPages.map(p => p.id));
          
          sessionPages.forEach(p => {
            if (!storedPageIds.has(p.id)) {
              allStoredPages.push(p);
              storedPageIds.add(p.id);
            }
          });
          
          sharedPages.forEach(p => {
            if (!storedPageIds.has(p.id)) {
              allStoredPages.push(p);
              storedPageIds.add(p.id);
            }
          });
          
          memberPages.forEach(p => {
            if (!storedPageIds.has(p.id)) {
              allStoredPages.push(p);
              storedPageIds.add(p.id);
            }
          });
          
          if (allStoredPages.length > 0) {
            // Filter pages based on user role
            let filteredPages = allStoredPages
            
            // If customer view, only show pages where user is a member
            if (isCustomerView && user) {
              filteredPages = allStoredPages.filter((page: PageModel) => {
                if (!page.members || page.members.length === 0) return false
                
                // Check if current user is a member
                return page.members.some((m: any) => {
                  const memberId = typeof m === 'string' ? m : (m.userId || m.id || m.email)
                  // Match against user's id, email, or customerId
                  return memberId === user.id || 
                         memberId === user.email ||
                         memberId === user.customerId ||
                         String(memberId).toLowerCase() === String(user.email).toLowerCase() ||
                         String(memberId).toLowerCase() === String(user.id).toLowerCase()
                })
              })
              console.log(`📋 Customer view (localStorage): Filtered ${filteredPages.length} pages from ${storedPages.length} total pages`)
            }
            
            const mappedRows: PageRow[] = filteredPages.map((page: PageModel, index: number) => {
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
            console.log('✅ Loaded', filteredPages.length, 'pages from storage (localStorage:', storedPages.length, ', sessionStorage:', sessionPages.length, ', sharedRegistry:', sharedPages.length, ', memberPages:', memberPages.length, ')', isCustomerView ? '(filtered for customer)' : '');
          } else {
            // No pages in localStorage - this is normal for first-time users
            setRows([]);
            setError(null); // Don't show error in offline mode
            console.log('ℹ️ No pages found. Create a page to get started.');
          }
        } catch (e) {
          console.error('Failed to load from localStorage:', e);
          setRows([]); // No default pages - show empty list
          setError(null); // Don't show error in offline mode
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
  }, [user, isCustomerView]) // Re-fetch when user changes or route changes

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
    // Use correct route based on user role
    if (isCustomerView) {
      navigate(`/customer/pages/${pageId}`, { state: { pageId, pageName: row.name } })
    } else {
      navigate('/communication/pages/demo', { state: { pageId, pageName: row.name } })
    }
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
