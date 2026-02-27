import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { activityTracking, Activity } from '../api/activityTracking'
import PageHeader from '../components/PageHeader'
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Button,
} from '@mui/material'
import { Refresh } from '@mui/icons-material'
// Custom Timeline components (since @mui/lab has version conflicts)
const Timeline = ({ children }: { children: React.ReactNode }) => (
  <Box style={{ position: 'relative', paddingLeft: 40 }}>
    {children}
  </Box>
)

const TimelineItem = ({ children }: { children: React.ReactNode }) => (
  <Box style={{ position: 'relative', paddingBottom: 24 }}>
    {children}
  </Box>
)

const TimelineSeparator = ({ children }: { children: React.ReactNode }) => (
  <Box style={{ position: 'absolute', left: -40, top: 0 }}>
    {children}
  </Box>
)

const TimelineConnector = () => (
  <Box style={{ width: 2, height: 24, background: '#e0e0e0', marginLeft: 9 }} />
)

const TimelineContent = ({ children }: { children: React.ReactNode }) => (
  <Box style={{ marginLeft: 40 }}>
    {children}
  </Box>
)

const TimelineDot = ({ children, color }: { children?: React.ReactNode; color?: string }) => (
  <Box
    style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: color === 'success' ? '#4caf50' :
                  color === 'error' ? '#f44336' :
                  color === 'warning' ? '#ff9800' :
                  color === 'info' ? '#2196f3' :
                  color === 'primary' ? '#1976d2' :
                  color === 'secondary' ? '#9c27b0' :
                  '#9e9e9e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
    }}
  >
    {children}
  </Box>
)

export default function ActivityFeedPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [actionFilter, setActionFilter] = useState<string>('ALL')

  useEffect(() => {
    loadActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [typeFilter, actionFilter, activities])

  const loadActivities = () => {
    const allActivities = activityTracking.getRecent(100)
    console.log('📊 Loaded activities:', allActivities.length)
    console.log('📊 Activities data:', allActivities)
    
    // Also check localStorage directly for debugging
    try {
      const localActivities = JSON.parse(localStorage.getItem('crmActivities') || '[]')
      console.log('📊 localStorage activities:', localActivities.length, localActivities)
    } catch (e) {
      console.error('Error reading localStorage activities:', e)
    }
    
    setActivities(allActivities)
  }

  const filterActivities = () => {
    let filtered = activities.filter(a => a && a.id && a.timestamp) // Filter out invalid activities

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.type === typeFilter)
    }

    if (actionFilter !== 'ALL') {
      filtered = filtered.filter(a => a.action === actionFilter)
    }

    console.log('📊 Filtered activities:', filtered.length)
    setFilteredActivities(filtered)
  }

  const getActionColor = (action: Activity['action']) => {
    switch (action) {
      case 'created':
        return 'success'
      case 'updated':
        return 'info'
      case 'deleted':
        return 'error'
      case 'converted':
        return 'warning'
      case 'email_sent':
        return 'primary'
      case 'status_changed':
      case 'stage_changed':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'lead':
        return '👤'
      case 'opportunity':
        return '💰'
      case 'account':
        return '🏢'
      default:
        return '📋'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <Container maxWidth="xl" style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper elevation={0} style={{ padding: 24, background: '#fff' }}>
        <PageHeader
          title="Activity Feed"
          right={
            <Box display="flex" gap={2} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={loadActivities}
                title="Refresh activity feed"
              >
                Refresh
              </Button>
              <FormControl size="small" style={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="lead">Leads</MenuItem>
                  <MenuItem value="opportunity">Opportunities</MenuItem>
                  <MenuItem value="account">Accounts</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" style={{ minWidth: 150 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Actions</MenuItem>
                  <MenuItem value="created">Created</MenuItem>
                  <MenuItem value="updated">Updated</MenuItem>
                  <MenuItem value="deleted">Deleted</MenuItem>
                  <MenuItem value="converted">Converted</MenuItem>
                  <MenuItem value="email_sent">Email Sent</MenuItem>
                  <MenuItem value="status_changed">Status Changed</MenuItem>
                  <MenuItem value="stage_changed">Stage Changed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          }
        />

        {filteredActivities.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: 40 }}>
            <Typography color="textSecondary" style={{ marginBottom: 16 }}>
              No activities found. Start using the CRM to see activity here.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                console.log('🔍 Manual check - localStorage activities:', JSON.parse(localStorage.getItem('crmActivities') || '[]'))
                console.log('🔍 Manual check - Current activities state:', activities)
                console.log('🔍 Manual check - Filtered activities:', filteredActivities)
                loadActivities()
              }}
            >
              Debug: Check localStorage
            </Button>
          </Box>
        ) : (
          <Timeline>
            {filteredActivities.map((activity, index) => (
              <TimelineItem key={activity.id}>
                <TimelineSeparator>
                  <TimelineDot color={getActionColor(activity.action) as any}>
                    {getTypeIcon(activity.type)}
                  </TimelineDot>
                  {index < filteredActivities.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Card elevation={1}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom={1}>
                        <Box>
                          <Typography variant="h6" style={{ fontSize: 16, fontWeight: 600 }}>
                            {activity.description}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
                            by {activity.userName}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1} flexDirection="column" alignItems="flex-end">
                          <Chip
                            label={activity.type}
                            size="small"
                            style={{ fontSize: 10 }}
                          />
                          <Chip
                            label={activity.action}
                            size="small"
                            color={getActionColor(activity.action) as any}
                            style={{ fontSize: 10 }}
                          />
                        </Box>
                      </Box>
                      {activity.changes && Object.keys(activity.changes).length > 0 && (
                        <Box marginTop={2} padding={2} style={{ background: '#f5f5f5', borderRadius: 4 }}>
                          <Typography variant="caption" style={{ fontWeight: 600 }}>
                            Changes:
                          </Typography>
                          {Object.entries(activity.changes).map(([key, change]) => (
                            <Typography key={key} variant="caption" display="block" style={{ marginTop: 4 }}>
                              <strong>{key}:</strong> {String(change.old)} → {String(change.new)}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: 'block' }}>
                        {formatTimestamp(activity.timestamp)}
                      </Typography>
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Paper>
    </Container>
  )
}
