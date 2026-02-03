import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { pagesApi } from '../api/apiClient'

export default function PageCreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state ?? {}) as { pageId?: string }
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('Private')
  const [userInput, setUserInput] = useState('')
  const [users, setUsers] = useState<string[]>(['alex@beam.com', 'jamie@beam.com'])
  const isEditMode = useMemo(() => Boolean(locationState.pageId), [locationState.pageId])
  const [editingId, setEditingId] = useState<string | null>(locationState.pageId ?? null)

  useEffect(() => {
    if (!locationState.pageId) return
    const fetchPage = async () => {
      try {
        const page = await pagesApi.get(locationState.pageId!)
        setEditingId(page.id)
        setName(page.name)
        setDescription(page.content?.heroTitle || '')
        setUsers(page.members.map(m => m.userId))
      } catch (err: any) {
        console.error('Failed to fetch page:', err)
        window.alert('Failed to load page: ' + (err.message || 'Unknown error'))
      }
    }
    fetchPage()
  }, [locationState.pageId])

  const addUser = () => {
    const trimmed = userInput.trim()
    if (!trimmed) return
    if (users.includes(trimmed)) return
    setUsers((prev) => [...prev, trimmed])
    setUserInput('')
  }

  const removeUser = (email: string) => {
    setUsers((prev) => prev.filter((u) => u !== email))
  }

  const [response, setResponse] = useState<any>(null)

  const persistPage = async (status: 'Active' | 'Draft') => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      window.alert('Please enter a page name.')
      return
    }

    try {
      const members = users.map(email => ({ userId: email, role: 'Member' as const }))
      
      if (editingId) {
        // Update existing page
        const result = await pagesApi.update(editingId, {
          name: trimmedName,
          members,
          content: description ? { heroTitle: description, sections: [], ctas: [] } : undefined,
        })
        setResponse({
          success: true,
          message: 'Page updated successfully',
          page: result
        })
        // Don't redirect - stay on the page
      } else {
        // Create new page
        const result = await pagesApi.create({
          type: 'LiveGroup',
          name: trimmedName,
          title: trimmedName, // Add title field for response format
          content: description || '',
          members,
        })
        
        // Display the response in JSON format as shown in image
        setResponse(result)
        
        // Don't redirect - stay on the page to show the response
        // User can manually navigate if needed
      }
    } catch (err: any) {
      console.error('Failed to save page:', err)
      setResponse({
        success: false,
        message: err.message || 'Unknown error',
        error: err
      })
      window.alert('Failed to save page: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="card">
      <PageHeader title={isEditMode ? 'Edit Page' : 'Create Page'} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div className="small-label">Page Name</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Team Chat" />
        </div>
        <div>
          <div className="small-label">Visibility</div>
          <select className="select" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option>Private</option>
            <option>Public</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="small-label">Description</div>
          <input
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short summary about this page"
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="small-label">Add Users (email)</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="name@company.com"
          />
          <button className="btn btn-secondary" onClick={addUser}>
            Add
          </button>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {users.map((email) => (
            <span
              key={email}
              style={{
                padding: '6px 10px',
                borderRadius: 20,
                background: '#f1f3f5',
                border: '1px solid #e6e6e6',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {email}
              <button
                onClick={() => removeUser(email)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={() => persistPage('Active')}>
          {isEditMode ? 'Save Changes' : 'Create Page'}
        </button>
        <button className="btn btn-secondary" onClick={() => persistPage('Draft')}>
          Save Draft
        </button>
      </div>

      {/* Display JSON response as shown in image */}
      {response && (
        <div style={{
          marginTop: 20,
          padding: 16,
          background: response.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${response.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: 6,
          color: response.success ? '#155724' : '#721c24'
        }}>
          <pre style={{
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
