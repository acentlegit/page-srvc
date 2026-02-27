import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { pagesApi } from '../api/apiClient'

export default function InvitationAcceptPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<any>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const token = searchParams.get('token')
        const email = searchParams.get('email')
        const pageId = searchParams.get('pageId')

        if (!token || !email || !pageId) {
          setError('Invalid invitation link. Missing required parameters.')
          setLoading(false)
          return
        }

        // Extract timestamp from token (format: timestamp-randomstring)
        const tokenParts = token.split('-')
        const tokenTimestamp = tokenParts.length > 0 ? parseInt(tokenParts[0]) : null
        
        // Check if invitation is expired (24 hours) based on token timestamp
        if (tokenTimestamp) {
          const now = Date.now()
          const hoursDiff = (now - tokenTimestamp) / (1000 * 60 * 60)
          
          if (hoursDiff > 24) {
            setError('This invitation has expired. Please request a new invitation.')
            setLoading(false)
            return
          }
        }

        // Try to find invitation in localStorage first
        const invitationKey = `invitations_${pageId}`
        const allInvitations = JSON.parse(localStorage.getItem(invitationKey) || '[]')
        
        // Also check global invitations by email
        const globalInvitations = JSON.parse(localStorage.getItem('allInvitations') || '[]')
        let foundInvitation = [...allInvitations, ...globalInvitations].find(
          (inv: any) => inv.token === token && inv.email === email && inv.pageId === pageId
        )

        // If not found in localStorage, try to fetch page and create invitation object
        if (!foundInvitation) {
          console.log('Invitation not found in localStorage, fetching page data...')
          
          try {
            // Try to fetch the page to validate it exists
            const page = await pagesApi.get(pageId)
            
            if (page) {
              // Extract page name with priority: name > default
              let extractedPageName = 'Page'
              if (page.name && page.name.trim() !== '' && page.name !== 'Untitled Page') {
                extractedPageName = page.name
              }
              
              // Create invitation object from URL parameters and page data
              foundInvitation = {
                id: token,
                token,
                pageId,
                pageName: extractedPageName,
                method: 'email',
                email: email,
                phone: null,
                nickname: email.split('@')[0] || 'User',
                invitedBy: 'admin',
                invitedAt: tokenTimestamp ? new Date(tokenTimestamp).toISOString() : new Date().toISOString(),
                status: 'pending',
                inviteLink: window.location.href
              }
              
              console.log('✅ Created invitation object from page data:', foundInvitation)
              console.log('📄 Page name extracted:', extractedPageName)
            } else {
              setError('Page not found. The invitation may be invalid.')
              setLoading(false)
              return
            }
          } catch (pageError: any) {
            // If page fetch fails, try to get page name from localStorage
            try {
              const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]')
              const storedPage = storedPages.find((p: any) => p.id === pageId)
              
            if (storedPage) {
              // Extract page name with priority: name > default
              let extractedPageName = 'Page'
              if (storedPage.name && storedPage.name.trim() !== '' && storedPage.name !== 'Untitled Page') {
                extractedPageName = storedPage.name
              }
                
                foundInvitation = {
                  id: token,
                  token,
                  pageId,
                  pageName: extractedPageName,
                  method: 'email',
                  email: email,
                  phone: null,
                  nickname: email.split('@')[0] || 'User',
                  invitedBy: 'admin',
                  invitedAt: tokenTimestamp ? new Date(tokenTimestamp).toISOString() : new Date().toISOString(),
                  status: 'pending',
                  inviteLink: window.location.href
                }
                console.log('✅ Created invitation object from localStorage page data:', foundInvitation)
                console.log('📄 Page name extracted:', extractedPageName)
              } else {
                // Still allow acceptance even if page not found - user can join anyway
                foundInvitation = {
                  id: token,
                  token,
                  pageId,
                  pageName: 'Page',
                  method: 'email',
                  email: email,
                  phone: null,
                  nickname: email.split('@')[0] || 'User',
                  invitedBy: 'admin',
                  invitedAt: tokenTimestamp ? new Date(tokenTimestamp).toISOString() : new Date().toISOString(),
                  status: 'pending',
                  inviteLink: window.location.href
                }
                console.log('Created default invitation object (page not found):', foundInvitation)
              }
            } catch (localError) {
              // Last resort: create minimal invitation object
              foundInvitation = {
                id: token,
                token,
                pageId,
                pageName: 'Page',
                method: 'email',
                email: email,
                phone: null,
                nickname: email.split('@')[0] || 'User',
                invitedBy: 'admin',
                invitedAt: tokenTimestamp ? new Date(tokenTimestamp).toISOString() : new Date().toISOString(),
                status: 'pending',
                inviteLink: window.location.href
              }
              console.log('Created minimal invitation object:', foundInvitation)
            }
          }
        }

        if (!foundInvitation) {
          setError('Invitation not found or has expired.')
          setLoading(false)
          return
        }

        setInvitation(foundInvitation)
        setLoading(false)
      } catch (err: any) {
        console.error('Failed to load invitation:', err)
        setError('Failed to load invitation: ' + (err.message || 'Unknown error'))
        setLoading(false)
      }
    }

    loadInvitation()
  }, [searchParams])

  const acceptInvitation = async (autoJoinVideo: boolean = false) => {
    if (!invitation) return

    setAccepting(true)
    try {
      // Set current user email from invitation
      localStorage.setItem('currentUserId', invitation.email)
      
      // Try to fetch page to get the correct page name
      // Priority: 1) API page name, 2) localStorage page name, 3) invitation pageName, 4) default
      let pageName = invitation.pageName || null
      
      try {
        const page = await pagesApi.get(invitation.pageId)
        if (page && page.name && page.name.trim() !== '' && page.name !== 'Untitled Page') {
          pageName = page.name
          console.log('✅ Fetched page name from API:', pageName)
        }
      } catch (pageError) {
        console.log('API fetch failed, trying localStorage:', pageError)
        // If page fetch fails, try localStorage
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]')
          const storedPage = storedPages.find((p: any) => p.id === invitation.pageId)
          if (storedPage) {
            if (storedPage.name && storedPage.name.trim() !== '' && storedPage.name !== 'Untitled Page') {
              pageName = storedPage.name
              console.log('✅ Fetched page name from localStorage:', pageName)
            } else if (storedPage.title && storedPage.title.trim() !== '' && storedPage.title !== 'Untitled Page') {
              pageName = storedPage.title
              console.log('✅ Fetched page title from localStorage:', pageName)
            }
          }
        } catch (localError) {
          console.log('Could not fetch page name from localStorage:', localError)
        }
      }
      
      // Final fallback: use invitation pageName if we still don't have one
      if (!pageName || pageName === 'Page' || pageName === 'Untitled Page') {
        if (invitation.pageName && invitation.pageName !== 'Page' && invitation.pageName !== 'Untitled Page') {
          pageName = invitation.pageName
          console.log('✅ Using invitation pageName:', pageName)
        } else {
          pageName = 'Page' // Last resort default
          console.log('⚠️ Using default page name')
        }
      }
      
      console.log('📄 Final page name to use:', pageName)
      
      // Add user to page members if not already added
      try {
        await pagesApi.operate(invitation.pageId, 'AddMember', invitation.email, 'Member', 'admin')
      } catch (apiError: any) {
        // API might fail, but continue with local storage
        console.log('API call failed, adding to local storage:', apiError.message)
      }

      // Update invitation status in localStorage (if it exists)
      try {
        const invitationKey = `invitations_${invitation.pageId}`
        const allInvitations = JSON.parse(localStorage.getItem(invitationKey) || '[]')
        const invitationIndex = allInvitations.findIndex((inv: any) => inv.token === invitation.token)
        
        if (invitationIndex >= 0) {
          // Update existing invitation
          allInvitations[invitationIndex] = {
            ...allInvitations[invitationIndex],
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            pageName: pageName
          }
          localStorage.setItem(invitationKey, JSON.stringify(allInvitations))
        } else {
          // Add new invitation if it wasn't in localStorage
          allInvitations.push({
            ...invitation,
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            pageName: pageName
          })
          localStorage.setItem(invitationKey, JSON.stringify(allInvitations))
        }

        // Also update global invitations
        const globalInvitations = JSON.parse(localStorage.getItem('allInvitations') || '[]')
        const globalIndex = globalInvitations.findIndex((inv: any) => inv.token === invitation.token)
        
        if (globalIndex >= 0) {
          globalInvitations[globalIndex] = {
            ...globalInvitations[globalIndex],
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            pageName: pageName
          }
        } else {
          globalInvitations.push({
            ...invitation,
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            pageName: pageName
          })
        }
        localStorage.setItem('allInvitations', JSON.stringify(globalInvitations))
      } catch (storageError) {
        console.log('Failed to update invitation in localStorage:', storageError)
      }

      // Add to local page data
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]')
        let pageIndex = storedPages.findIndex((p: any) => p.id === invitation.pageId)
        
        if (pageIndex >= 0) {
          // Update existing page
          const page = storedPages[pageIndex]
          if (!page.members) page.members = []
          if (!page.members.includes(invitation.email) && !page.members.some((m: any) => (typeof m === 'string' ? m : m.userId) === invitation.email)) {
            page.members.push(invitation.email)
          }
          // Update page name if we have a better one
          if (pageName && pageName !== 'Page') {
            page.name = pageName
            page.title = pageName
          }
          localStorage.setItem('localPages', JSON.stringify(storedPages))
        } else {
          // Create new page entry if it doesn't exist
          storedPages.push({
            id: invitation.pageId,
            name: pageName,
            title: pageName,
            members: [invitation.email],
            type: 'LiveGroup'
          })
          localStorage.setItem('localPages', JSON.stringify(storedPages))
        }
      } catch (localError) {
        console.log('Failed to update local storage:', localError)
      }

      // Navigate to the page
      navigate(`/communication/pages/demo`, {
        state: {
          pageId: invitation.pageId,
          pageName: pageName,
          autoJoinVideo
        }
      })
    } catch (err: any) {
      console.error('Failed to accept invitation:', err)
      setError('Failed to accept invitation: ' + (err.message || 'Unknown error'))
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 16, color: '#666' }}>Loading invitation...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: 500
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>Invitation Error</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>{error}</p>
          <button
            onClick={() => navigate('/communication/pages')}
            style={{
              padding: '12px 24px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Go to Pages
          </button>
        </div>
      </div>
    )
  }

  const handleViewPage = async () => {
    await acceptInvitation(false)
  }

  const handleJoinVideo = async () => {
    await acceptInvitation(true)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#fff',
      padding: '20px'
    }}>
      <div style={{
        background: '#f5f5f5',
        padding: '60px 40px',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: 500,
        width: '100%'
      }}>
        <h1 style={{ 
          margin: '0 0 24px 0', 
          color: '#000', 
          fontSize: 24, 
          fontWeight: 700 
        }}>
          Page Invitation
        </h1>
        
        <p style={{ 
          color: '#000', 
          marginBottom: 32, 
          fontSize: 16,
          lineHeight: 1.5
        }}>
          To view the invitation page, please click the button below
        </p>
        
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
          flexDirection: 'column'
        }}>
          <button
            onClick={handleViewPage}
            disabled={accepting}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: accepting ? '#ccc' : '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: accepting ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: 600
            }}
          >
            {accepting ? 'Loading...' : 'Accept'}
          </button>
          
          <button
            onClick={handleJoinVideo}
            disabled={accepting}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: '#fff',
              color: '#4caf50',
              border: '2px solid #4caf50',
              borderRadius: 8,
              cursor: accepting ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Join Video
          </button>
        </div>
        
        <p style={{ 
          color: '#000', 
          margin: 0, 
          fontSize: 14,
          lineHeight: 1.5
        }}>
          Thank you for being a member of the beamFamily.
        </p>
      </div>
    </div>
  )
}
