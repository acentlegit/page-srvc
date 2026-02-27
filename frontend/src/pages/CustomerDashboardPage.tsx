import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { pagesApi, PageModel } from '../api/apiClient'
import { convertPageToChat, isChatPage } from '../utils/pageUtils'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material'
import { Chat, Description, Upload, Pages } from '@mui/icons-material'

export default function CustomerDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assignedPages, setAssignedPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        let allPages: PageModel[] = []
        
        // Try to fetch from API first
        try {
          allPages = await pagesApi.list()
        } catch (apiErr) {
          console.log('API fetch failed, trying localStorage...', apiErr)
        }
        
        // If API returns empty, try localStorage, sessionStorage, and member pages
        if (allPages.length === 0) {
          try {
            const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[]
            
            // Also check sessionStorage
            let sessionPages: PageModel[] = []
            try {
              sessionPages = JSON.parse(sessionStorage.getItem('sessionPages') || '[]') as PageModel[]
            } catch (e) {
              // Ignore
            }
            
            // Also check the shared pages registry for cross-browser access
            let sharedPages: PageModel[] = []
            try {
              const sharedPagesRegistry = JSON.parse(localStorage.getItem('sharedPagesRegistry') || '[]') as PageModel[]
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
            let memberPages: PageModel[] = []
            try {
              if (user?.email) {
                const memberPagesKey = `memberPages_${user.email.toLowerCase()}`
                memberPages = JSON.parse(localStorage.getItem(memberPagesKey) || '[]') as PageModel[]
              }
            } catch (e) {
              // Ignore
            }
            
            // Merge localStorage, sessionStorage, shared pages, and member pages
            allPages = [...storedPages]
            const storedPageIds = new Set(storedPages.map(p => p.id))
            
            sessionPages.forEach(p => {
              if (!storedPageIds.has(p.id)) {
                allPages.push(p)
                storedPageIds.add(p.id)
              }
            })
            
            sharedPages.forEach(p => {
              if (!storedPageIds.has(p.id)) {
                allPages.push(p)
                storedPageIds.add(p.id)
              }
            })
            
            memberPages.forEach(p => {
              if (!storedPageIds.has(p.id)) {
                allPages.push(p)
                storedPageIds.add(p.id)
              }
            })
            
            console.log('Loaded pages from storage:', allPages.length, '(localStorage:', storedPages.length, ', sessionStorage:', sessionPages.length, ', sharedRegistry:', sharedPages.length, ', memberPages:', memberPages.length, ')')
          } catch (localErr) {
            console.error('Failed to load from storage:', localErr)
          }
        }
        
        // Filter pages where user is a member
        if (user?.id || user?.email) {
          const userPages = allPages.filter((page: PageModel) => {
            if (!page.members || page.members.length === 0) return false
            return page.members.some((m: any) => {
              const memberId = typeof m === 'string' ? m : (m.userId || m.id || m.email)
              // Match against user's id, email, or customerId (case-insensitive)
              const match = memberId === user.id || 
                           memberId === user.email ||
                           memberId === user.customerId ||
                           String(memberId).toLowerCase() === String(user.email).toLowerCase() ||
                           String(memberId).toLowerCase() === String(user.id).toLowerCase() ||
                           String(memberId).toLowerCase() === String(user.customerId).toLowerCase()
              
              if (match) {
                console.log('✅ Page match found:', {
                  pageName: page.name,
                  memberId,
                  userEmail: user.email,
                  userId: user.id
                })
              }
              return match
            })
          })
          setAssignedPages(userPages)
          console.log('📋 Assigned pages for user:', userPages.length, 'out of', allPages.length, 'total pages')
          if (userPages.length === 0 && allPages.length > 0) {
            console.log('⚠️ No pages matched. User:', { id: user.id, email: user.email, customerId: user.customerId })
            console.log('⚠️ Available pages:', allPages.map(p => ({
              name: p.name,
              members: p.members
            })))
          }
        } else {
          setAssignedPages([])
        }
      } catch (err) {
        console.error('Failed to fetch pages:', err)
        setAssignedPages([])
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchPages()
    }
  }, [user])

  return (
    <Container maxWidth="lg" style={{ marginTop: 20 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome, {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customer ID: {user?.customerId || 'N/A'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} style={{ padding: 20, marginBottom: 20 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Chat />}
                  onClick={() => navigate('/customer/chat')}
                  sx={{ py: 2 }}
                >
                  Start Chat
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Description />}
                  onClick={() => navigate('/customer/forms')}
                  sx={{ py: 2 }}
                >
                  Submit Form
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={() => navigate('/customer/upload')}
                  sx={{ py: 2 }}
                >
                  Upload Files
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Pages />}
                  onClick={() => navigate('/customer/pages')}
                  sx={{ py: 2 }}
                >
                  My Pages
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Assigned Pages */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            My Assigned Pages
          </Typography>
          {loading ? (
            <Typography>Loading pages...</Typography>
          ) : assignedPages.length === 0 ? (
            <Paper elevation={1} style={{ padding: 40, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No pages assigned yet. Contact your administrator to get access to pages.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {assignedPages.map((page) => (
                <Grid item xs={12} sm={6} md={4} key={page.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {page.name || 'Untitled Page'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {page.type || 'Standard Page'}
                      </Typography>
                      <Box mt={1}>
                        <Chip
                          label={page.type === 'ChatPage' ? 'Chat Page' : 'Standard Page'}
                          size="small"
                          color={page.type === 'ChatPage' ? 'primary' : 'default'}
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate(`/customer/pages/${page.id}`)}
                      >
                        View Page
                      </Button>
                      {!isChatPage(page) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={async () => {
                            if (window.confirm('Convert this page to a chat page? This will enable chat functionality.')) {
                              try {
                                // Update page type in localStorage
                                try {
                                  const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[]
                                  const pageIndex = storedPages.findIndex((p: PageModel) => p.id === page.id)
                                  if (pageIndex >= 0) {
                                    storedPages[pageIndex] = {
                                      ...storedPages[pageIndex],
                                      type: 'ChatPage' as any,
                                      updatedAt: Date.now()
                                    }
                                    localStorage.setItem('localPages', JSON.stringify(storedPages))
                                  }
                                } catch (localErr) {
                                  console.log('Failed to update localStorage:', localErr)
                                }
                                
                                // Try API update
                                try {
                                  await pagesApi.update(page.id, { type: 'ChatPage' as any })
                                } catch (apiErr) {
                                  console.log('API update failed, but localStorage updated:', apiErr)
                                }
                                
                                // Refresh the page list
                                const updatedPages = assignedPages.map((p: PageModel) => 
                                  p.id === page.id ? { ...p, type: 'ChatPage' as any } : p
                                )
                                setAssignedPages(updatedPages)
                                
                                window.alert('Page converted to chat page successfully!')
                                
                                // Optionally navigate to the page
                                setTimeout(() => {
                                  navigate(`/customer/pages/${page.id}`)
                                }, 500)
                              } catch (err: any) {
                                console.error('Conversion error:', err)
                                window.alert('Failed to convert page: ' + (err.message || 'Unknown error'))
                              }
                            }
                          }}
                        >
                          Convert to Chat
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}
