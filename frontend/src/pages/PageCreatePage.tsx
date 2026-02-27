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
  const [users, setUsers] = useState<string[]>([])
  const isEditMode = useMemo(() => Boolean(locationState.pageId), [locationState.pageId])
  const [editingId, setEditingId] = useState<string | null>(locationState.pageId ?? null)
  const [selectedMedia, setSelectedMedia] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<Array<{ type: 'image' | 'audio' | 'video', url: string, filename: string }>>([])

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

  // Handle media file selection
  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedMedia((prev) => [...prev, ...files])

    // Create previews
    const newPreviews: Array<{ type: 'image' | 'audio' | 'video', url: string, filename: string }> = []
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = () => {
        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('audio/') ? 'audio' : 
                        file.type.startsWith('video/') ? 'video' : 'image'
        
        newPreviews.push({
          type: fileType as 'image' | 'audio' | 'video',
          url: reader.result as string,
          filename: file.name
        })
        
        if (newPreviews.length === files.length) {
          setMediaPreviews((prev) => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index))
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index))
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
        const pageData: any = {
          type: 'LiveGroup',
          name: trimmedName,
          title: trimmedName,
          content: description || '',
          members,
        }

        // Store media in localStorage for the new page
        if (mediaPreviews.length > 0) {
          // We'll store media after page creation
          pageData._media = mediaPreviews
        }

        const result = await pagesApi.create(pageData)
        
        // Store media in localStorage with page ID
        const pageId = (result as any)?.page?.id || (result as any)?.id || (result as any)?.objectId
        if (mediaPreviews.length > 0 && pageId) {
          localStorage.setItem(`pageMedia_${pageId}`, JSON.stringify(mediaPreviews))
        }
        
        // Display the response in JSON format as shown in image
        setResponse(result)
        
        // Show export option for cross-browser sharing
        const pageDataForExport = {
          id: pageId,
          type: 'LiveGroup',
          name: trimmedName,
          members: members,
          content: description || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        // Store in shared registry for cross-browser access
        try {
          const sharedRegistry = JSON.parse(localStorage.getItem('sharedPagesRegistry') || '[]')
          const existingIndex = sharedRegistry.findIndex((p: any) => p.id === pageId)
          if (existingIndex >= 0) {
            sharedRegistry[existingIndex] = pageDataForExport
          } else {
            sharedRegistry.push(pageDataForExport)
          }
          localStorage.setItem('sharedPagesRegistry', JSON.stringify(sharedRegistry))
          
          // Create export link for cross-browser sharing
          const exportData = btoa(JSON.stringify([pageDataForExport]))
          const exportUrl = `${window.location.origin}${window.location.pathname}?import=${exportData}`
          
          console.log('📋 Page created! To share across browsers:')
          console.log('1. Copy this URL:', exportUrl)
          console.log('2. Or copy this data:', JSON.stringify([pageData], null, 2))
          console.log('3. Customer can import it in their browser')
        } catch (e) {
          console.warn('Failed to create export link:', e)
        }
        
        // Optionally redirect to page detail after creation
        // Uncomment the line below to auto-redirect:
        // navigate(`/communication/pages/demo`, { state: { pageId: pageId } })
        
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

      {/* Media Upload Section */}
      <div style={{ marginBottom: 16 }}>
        <div className="small-label">Add Media (Images, Audio, Video)</div>
        <label style={{ 
          display: 'inline-block', 
          padding: '10px 16px', 
          background: '#f0f7ff', 
          border: '1px solid #b3d9ff', 
          borderRadius: 6, 
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          color: '#0066cc'
        }}>
          📎 Choose Files
          <input
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            onChange={handleMediaSelect}
            style={{ display: 'none' }}
          />
        </label>
        
        {mediaPreviews.length > 0 && (
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {mediaPreviews.map((preview, idx) => (
              <div key={idx} style={{ position: 'relative', border: '1px solid #e6e6e6', borderRadius: 6, overflow: 'hidden' }}>
                {preview.type === 'image' && (
                  <img src={preview.url} alt={preview.filename} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                )}
                {preview.type === 'audio' && (
                  <div style={{ width: '100%', height: 100, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    🎵
                  </div>
                )}
                {preview.type === 'video' && (
                  <div style={{ width: '100%', height: 100, background: '#fce4ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    🎥
                  </div>
                )}
                <button
                  onClick={() => removeMedia(idx)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    border: 'none',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    cursor: 'pointer',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
                <div style={{ padding: 4, fontSize: 10, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {preview.filename}
                </div>
              </div>
            ))}
          </div>
        )}
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
