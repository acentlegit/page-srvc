import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { pagesApi, PageModel } from '../api/apiClient'
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
  Badge,
} from '@mui/material'
import { Chat, Assignment, People, Pages } from '@mui/icons-material'

export default function StaffDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assignedPages, setAssignedPages] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        let allPages: PageModel[] = []
        
        // Try to fetch from API first
        try {
          allPages = await pagesApi.list()
        } catch (apiErr) {
          console.log('API fetch failed, trying localStorage...', apiErr)
        }
        
        // If API returns empty, try localStorage
        if (allPages.length === 0) {
          try {
            const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[]
            allPages = storedPages
            console.log('Loaded pages from localStorage:', storedPages.length)
          } catch (localErr) {
            console.error('Failed to load from localStorage:', localErr)
          }
        }
        
        // Filter pages where user is a member
        if (user?.id || user?.email) {
          const userPages = allPages.filter((page: PageModel) => {
            if (!page.members || page.members.length === 0) return false
            return page.members.some((m: any) => {
              const memberId = typeof m === 'string' ? m : m.userId
              return memberId === user.id || 
                     memberId === user.email
            })
          })
          setAssignedPages(userPages)
          console.log('Assigned pages for staff:', userPages.length)
        } else {
          setAssignedPages([])
        }

        // TODO: Fetch tasks from API
        // const staffTasks = await tasksApi.getByStaff(user.id)
        // setTasks(staffTasks)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setAssignedPages([])
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchData()
    }
  }, [user])

  return (
    <Container maxWidth="lg" style={{ marginTop: 20 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Staff Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.firstName} {user?.lastName}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} style={{ padding: 20, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {assignedPages.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assigned Pages
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} style={{ padding: 20, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {tasks.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Tasks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} style={{ padding: 20, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Chats
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} style={{ padding: 20 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Chat />}
                  onClick={() => navigate('/staff/chat')}
                  sx={{ py: 2 }}
                >
                  Customer Chats
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/staff/tasks')}
                  sx={{ py: 2 }}
                >
                  <Badge badgeContent={tasks.filter(t => t.status === 'pending').length} color="error">
                    My Tasks
                  </Badge>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<People />}
                  onClick={() => navigate('/staff/customers')}
                  sx={{ py: 2 }}
                >
                  Assigned Customers
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Pages />}
                  onClick={() => navigate('/staff/pages')}
                  sx={{ py: 2 }}
                >
                  My Pages
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Assigned Pages */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Assigned Pages
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : assignedPages.length === 0 ? (
            <Paper elevation={1} style={{ padding: 40, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No pages assigned yet.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {assignedPages.map((page) => (
                <Grid item xs={12} sm={6} key={page.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {page.name || 'Untitled Page'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Members: {page.members?.length || 0}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate(`/staff/pages/${page.id}`)}
                      >
                        View & Chat
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Tasks */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Recent Tasks
          </Typography>
          {tasks.length === 0 ? (
            <Paper elevation={1} style={{ padding: 20, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                No tasks assigned
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={1}>
              {tasks.slice(0, 5).map((task) => (
                <Grid item xs={12} key={task.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" fontWeight="bold">
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.status}
                        size="small"
                        color={task.status === 'completed' ? 'success' : 'default'}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
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
