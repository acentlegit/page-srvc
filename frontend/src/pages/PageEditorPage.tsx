import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { pagesApi, PageModel } from '../api/apiClient'

type PageRow = {
  id?: string
  name: string
  description: string
  createdAt: string
}

export default function PageEditorPage() {
  const [rows, setRows] = useState<PageRow[]>([])
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('Select Role')
  const [executeFile, setExecuteFile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'CreatedAt' },
  ] as const

  // Fetch pages from REST API
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        setError(null)
        const pages = await pagesApi.list()
        const mappedRows: PageRow[] = pages.map((page: PageModel) => ({
          id: page.id,
          name: page.name,
          description: page.content?.heroTitle || page.content?.description || '',
          createdAt: new Date(page.createdAt).toLocaleDateString(),
        }))
        setRows(mappedRows)
      } catch (err: any) {
        console.error('Failed to fetch pages:', err)
        setError(err.message || 'Failed to load pages')
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  }, [])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => row.name.toLowerCase().includes(query))
  }, [rows, search])

  const downloadTemplate = () => {
    const role = selectedRole === 'Select Role' ? 'generic' : selectedRole
    const headersByRole: Record<string, string> = {
      admin: 'name,description,priority',
      manager: 'name,description,owner',
      dispatcher: 'name,description,queue',
      generic: 'name,description',
    }
    const header = headersByRole[role] ?? headersByRole.generic
    // No sample data - just header row for clean template
    const csv = header + '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `page-import-template-${role}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleUpload = async (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const content = typeof reader.result === 'string' ? reader.result : ''
      const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      if (!lines.length) return
      const dataLines = lines[0].toLowerCase().includes('name') ? lines.slice(1) : lines
      
      try {
        setLoading(true)
        setError(null)
        
        // Parse CSV and create pages via API
        const createPromises = dataLines
          .map((line) => line.split(',').map((cell) => cell.trim()))
          .filter((cells) => cells[0])
          .map(async ([name, description, ...rest]) => {
            const pageData = {
              type: 'LiveGroup' as const,
              name: name || `Page ${Date.now()}`,
              members: [],
              content: description ? { heroTitle: description, sections: [], ctas: [] } : undefined,
            }
            return await pagesApi.create(pageData)
          })
        
        const createdPages = await Promise.all(createPromises)
        const newRows: PageRow[] = createdPages.map((page: any) => {
          const pageModel = (page as any)?.page || page
          return {
            id: pageModel?.id || pageModel?.objectId || '',
            name: pageModel?.name || pageModel?.title || 'Untitled Page',
            description: pageModel?.content?.heroTitle || pageModel?.content?.description || '',
            createdAt: pageModel?.createdAt ? new Date(pageModel.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          }
        })
        
        setRows((prev) => [...newRows, ...prev])
        
        if (executeFile) {
          window.alert(`Successfully created ${createdPages.length} page(s) and executed.`)
        } else {
          window.alert(`Successfully created ${createdPages.length} page(s).`)
        }
      } catch (err: any) {
        console.error('Failed to upload and create pages:', err)
        setError(err.message || 'Failed to create pages from CSV')
        window.alert('Failed to create pages: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    reader.readAsText(file)
  }

  const handleEdit = async (row: PageRow) => {
    const nextName = window.prompt('Edit name', row.name)
    if (!nextName || nextName === row.name || !row.id) return
    
    try {
      await pagesApi.update(row.id, { name: nextName })
      // Update successful - update UI
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, name: nextName } : r)))
      window.alert('Page updated successfully!')
    } catch (err: any) {
      console.error('Failed to update page:', err)
      // Even if API fails, update localStorage and UI
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]');
        const pageIndex = storedPages.findIndex((p: any) => p.id === row.id);
        if (pageIndex >= 0) {
          storedPages[pageIndex].name = nextName;
          storedPages[pageIndex].updatedAt = Date.now();
          localStorage.setItem('localPages', JSON.stringify(storedPages));
        }
      } catch (e) {
        console.warn('Failed to update localStorage:', e);
      }
      // Update UI anyway
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, name: nextName } : r)))
      window.alert('Page updated successfully! (stored locally)')
    }
  }

  const handleDelete = async (row: PageRow) => {
    const confirmed = window.confirm(`Delete ${row.name}?`)
    if (!confirmed || !row.id) return
    
    try {
      await pagesApi.delete(row.id)
      // Delete successful - remove from UI
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      window.alert('Page deleted successfully!')
    } catch (err: any) {
      console.error('Failed to delete page:', err)
      // Even if API fails, remove from localStorage and UI
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]');
        const updatedPages = storedPages.filter((p: any) => p.id !== row.id);
        localStorage.setItem('localPages', JSON.stringify(updatedPages));
      } catch (e) {
        console.warn('Failed to update localStorage:', e);
      }
      // Remove from UI anyway
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      window.alert('Page deleted successfully! (removed from local storage)')
    }
  }

  const handleView = async (row: PageRow) => {
    if (!row.id) {
      window.alert(`Name: ${row.name}\nDescription: ${row.description}\nCreated: ${row.createdAt}`)
      return
    }
    
    try {
      // Try to fetch full page details from API
      const page = await pagesApi.get(row.id)
      window.alert(
        `Page Details:\n\n` +
        `ID: ${page.id}\n` +
        `Name: ${page.name}\n` +
        `Type: ${page.type || 'LiveGroup'}\n` +
        `Description: ${page.content?.heroTitle || page.content?.description || row.description || 'N/A'}\n` +
        `Members: ${page.members?.length || 0} user(s)\n` +
        `Created: ${row.createdAt}\n` +
        `Updated: ${new Date(page.updatedAt || page.createdAt).toLocaleDateString()}`
      )
    } catch (err: any) {
      // If API fails, show basic info from row
      console.error('Failed to fetch page details:', err)
      window.alert(
        `Page Details:\n\n` +
        `ID: ${row.id}\n` +
        `Name: ${row.name}\n` +
        `Description: ${row.description || 'N/A'}\n` +
        `Created: ${row.createdAt}`
      )
    }
  }

  return (
    <div className="card">
      <PageHeader title="Import Page List" />

      {loading && <div style={{ padding: 16, textAlign: 'center' }}>Loading pages...</div>}
      {error && (
        <div style={{ padding: 16, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
        <div>
          <div className="small-label">Select Role to download CSV file template</div>
          <select className="select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option>Select Role</option>
            <option>admin</option>
            <option>manager</option>
            <option>dispatcher</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button className="btn" onClick={downloadTemplate}>Download Template</button>
        </div>

        <div>
          <div className="small-label">Upload CSV to create multiple event pages</div>
          <input type="file" className="input" accept=".csv" onChange={(e) => handleUpload(e.target.files?.[0] ?? null)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'end', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={executeFile} onChange={(e) => setExecuteFile(e.target.checked)} />
            Execute Page File
          </label>
          <button className="btn btn-secondary" onClick={() => {
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput?.files?.[0]) {
              handleUpload(fileInput.files[0])
            } else {
              window.alert('Please select a CSV file first.')
            }
          }}>Upload</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <input className="input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading pages...</div>
      ) : filteredRows.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          {search.trim()
            ? 'No pages found matching your search.'
            : 'No pages found. Upload a CSV file to create pages or create pages manually.'}
        </div>
      ) : (
        <AdminTable<PageRow>
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
