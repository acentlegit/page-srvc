import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { pagesApi } from '../api/apiClient'
import PageHeader from '../components/PageHeader'
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Add, ArrowBack } from '@mui/icons-material'

export default function CustomerAddPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pageId, setPageId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState<{ name: string; id: string; exists: boolean } | null>(null)
  const [checkingPage, setCheckingPage] = useState(false)

  // Function to check if page exists and get its info
  const checkPageExists = async (id: string) => {
    if (!id || !id.trim()) {
      setPageInfo(null)
      return
    }

    try {
      setCheckingPage(true)
      setError(null)
      
      let page: any = null
      
      // Try API first
      try {
        page = await pagesApi.get(id.trim())
      } catch (apiErr: any) {
        // If API fails, check localStorage
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]')
        const foundPage = storedPages.find((p: any) => 
          String(p.id) === String(id.trim())
        )
        
        if (foundPage) {
          page = foundPage
        } else {
          // Also check shared registry
          const sharedRegistry = JSON.parse(localStorage.getItem('sharedPagesRegistry') || '[]')
          const registryPage = sharedRegistry.find((p: any) => 
            String(p.id) === String(id.trim())
          )
          if (registryPage) {
            page = registryPage
          }
        }
      }

      if (page && page.id) {
        const pageName = page.name || page.title || 'Untitled Page'
        setPageInfo({
          name: pageName,
          id: page.id,
          exists: true
        })
        setError(null)
      } else {
        setPageInfo({
          name: '',
          id: id.trim(),
          exists: false
        })
        setError('Page not available. Please check the page ID and try again.')
      }
    } catch (err: any) {
      setPageInfo({
        name: '',
        id: id.trim(),
        exists: false
      })
      setError('Page not available. Please check the page ID and try again.')
    } finally {
      setCheckingPage(false)
    }
  }

  // Debounce page check when pageId changes
  useEffect(() => {
    if (!pageId.trim()) {
      setPageInfo(null)
      setError(null)
      return
    }

    const timeoutId = setTimeout(() => {
      checkPageExists(pageId.trim())
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  const handleJoinPage = async () => {
    if (!pageId || !pageId.trim()) {
      setError('Please enter a page ID.')
      return
    }

    if (!user?.email && !user?.id) {
      setError('User information not found. Please log in again.')
      return
    }

    // Check if page exists first
    if (!pageInfo || !pageInfo.exists) {
      await checkPageExists(pageId.trim())
      if (!pageInfo || !pageInfo.exists) {
        setError('Page not available. Please check the page ID and try again.')
        return
      }
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Get the page first to check if it exists
      let page
      try {
        page = await pagesApi.get(pageId.trim())
      } catch (err: any) {
        // If page not found, try to check if it exists in localStorage
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]')
        const foundPage = storedPages.find((p: any) => 
          String(p.id) === String(pageId.trim())
        )
        if (foundPage) {
          page = foundPage
        } else {
          // Check shared registry
          const sharedRegistry = JSON.parse(localStorage.getItem('sharedPagesRegistry') || '[]')
          const registryPage = sharedRegistry.find((p: any) => 
            String(p.id) === String(pageId.trim())
          )
          if (registryPage) {
            page = registryPage
          } else {
            throw new Error('Page not available. Please check the page ID and try again.')
          }
        }
      }

      // Ensure we have the correct page name
      const pageName = page.name || page.title || pageInfo?.name || 'Untitled Page'

      // Check if user is already a member
      const userIdentifier = user.email || user.id || user.customerId
      const isAlreadyMember = page.members?.some((m: any) => {
        const memberId = typeof m === 'string' ? m : (m.userId || m.id || m.email)
        return memberId === userIdentifier ||
               String(memberId).toLowerCase() === String(userIdentifier).toLowerCase()
      })

      if (isAlreadyMember) {
        setSuccess(`You are already a member of this page: "${pageName}". Redirecting...`)
        setTimeout(() => {
          navigate(`/customer/pages/${pageId.trim()}`)
        }, 1500)
        return
      }

      // Add user as a member
      const currentMembers = page.members || []
      const newMember = {
        userId: userIdentifier,
        role: 'Member'
      }

      // Update page with new member
      const updatedMembers = [
        ...currentMembers.map((m: any) => 
          typeof m === 'string' 
            ? { userId: m, role: 'Member' }
            : { userId: m.userId || m.id || m.email, role: m.role || 'Member' }
        ),
        newMember
      ]

      // Try API update first
      try {
        await pagesApi.update(pageId.trim(), {
          members: updatedMembers
        })
      } catch (apiErr: any) {
        console.log('API update failed, updating localStorage:', apiErr)
      }

      // Update localStorage
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]')
        const pageIndex = storedPages.findIndex((p: any) => p.id === pageId.trim())
        if (pageIndex >= 0) {
          storedPages[pageIndex] = {
            ...storedPages[pageIndex],
            members: updatedMembers,
            updatedAt: Date.now()
          }
        } else {
          // If page not in localStorage, add it with correct name
          storedPages.push({
            id: pageId.trim(),
            type: page.type || 'LiveGroup',
            name: pageName,
            members: updatedMembers,
            connections: {},
            content: page.content || '',
            createdAt: page.createdAt || Date.now(),
            updatedAt: Date.now()
          })
        }
        localStorage.setItem('localPages', JSON.stringify(storedPages))

        // Also update shared registry
        try {
          const sharedRegistry = JSON.parse(localStorage.getItem('sharedPagesRegistry') || '[]')
          const registryIndex = sharedRegistry.findIndex((p: any) => p.id === pageId.trim())
          if (registryIndex >= 0) {
            sharedRegistry[registryIndex] = {
              ...sharedRegistry[registryIndex],
              members: updatedMembers,
              updatedAt: Date.now()
            }
          } else {
            sharedRegistry.push({
              id: pageId.trim(),
              type: page.type || 'LiveGroup',
              name: pageName,
              members: updatedMembers,
              connections: {},
              content: page.content || '',
              createdAt: page.createdAt || Date.now(),
              updatedAt: Date.now()
            })
          }
          localStorage.setItem('sharedPagesRegistry', JSON.stringify(sharedRegistry))
        } catch (e) {
          console.warn('Failed to update shared registry:', e)
        }

        // Store in member-specific location
        if (userIdentifier && typeof userIdentifier === 'string' && userIdentifier.includes('@')) {
          try {
            const memberPagesKey = `memberPages_${userIdentifier.toLowerCase()}`
            const memberPages = JSON.parse(localStorage.getItem(memberPagesKey) || '[]')
            const memberPageIndex = memberPages.findIndex((p: any) => p.id === pageId.trim())
            const pageToStore = {
              id: pageId.trim(),
              type: page.type || 'LiveGroup',
              name: pageName,
              members: updatedMembers,
              connections: {},
              content: page.content || '',
              createdAt: page.createdAt || Date.now(),
              updatedAt: Date.now()
            }
            if (memberPageIndex >= 0) {
              memberPages[memberPageIndex] = pageToStore
            } else {
              memberPages.push(pageToStore)
            }
            localStorage.setItem(memberPagesKey, JSON.stringify(memberPages))
          } catch (e) {
            console.warn('Failed to update member pages:', e)
          }
        }
      } catch (localErr) {
        console.error('Failed to update localStorage:', localErr)
        throw new Error('Failed to join page. Please try again.')
      }

      setSuccess(`Successfully joined page: "${pageName}"! Redirecting...`)
      
      // Redirect to the page after 1.5 seconds
      setTimeout(() => {
        navigate(`/customer/pages/${pageId.trim()}`)
      }, 1500)
    } catch (err: any) {
      console.error('Failed to join page:', err)
      setError(err.message || 'Failed to join page. Please check the page ID and try again.')
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper elevation={3} style={{ padding: 30, borderRadius: 12 }}>
        <PageHeader title="Add Page" />
        
        <Box mb={3}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Enter a page ID to join an existing page. You'll be added as a member and can start chatting or viewing the page content.
          </Typography>
          <Typography variant="body2" color="text.secondary" style={{ fontStyle: 'italic' }}>
            Your email: <strong>{user?.email || user?.id || 'N/A'}</strong>
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} style={{ marginBottom: 16 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} style={{ marginBottom: 16 }}>
            {success}
          </Alert>
        )}

        <Box mb={3}>
          <TextField
            fullWidth
            label="Page ID"
            value={pageId}
            onChange={(e) => {
              setPageId(e.target.value)
              setError(null)
              setSuccess(null)
            }}
            placeholder="Enter page ID (e.g., 1, 2, support-chat...)"
            disabled={loading}
            variant="outlined"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading && !checkingPage) {
                if (pageInfo && pageInfo.exists) {
                  handleJoinPage()
                } else {
                  checkPageExists(pageId.trim())
                }
              }
            }}
            helperText={
              checkingPage 
                ? 'Checking page...' 
                : pageInfo 
                  ? pageInfo.exists 
                    ? `Page found: "${pageInfo.name}"` 
                    : 'Page not available'
                  : 'Enter a page ID to check availability'
            }
            error={pageInfo !== null && !pageInfo.exists}
          />
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
            onClick={handleJoinPage}
            disabled={loading || !pageId.trim() || checkingPage || (pageInfo !== null && !pageInfo.exists)}
            size="large"
            style={{ flex: 1 }}
          >
            {loading ? 'Joining...' : 'Join Page'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/customer/dashboard')}
            disabled={loading}
            size="large"
          >
            Back to Dashboard
          </Button>
        </Box>

        <Box mt={3} p={2} style={{ background: '#f5f5f5', borderRadius: 8 }}>
          <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 'bold' }}>
            How to get a Page ID:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>Ask your administrator or staff for the page ID</li>
              <li>Page IDs are usually numbers (1, 2, 3...) or names (support-chat, team-page)</li>
              <li>Once you join, the page will appear in your "My Pages" list</li>
            </ul>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}
