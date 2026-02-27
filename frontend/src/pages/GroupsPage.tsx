import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { groupsApi, Group } from '../api/apiClient'
import { usersApi } from '../api/apiClient'
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import { Add, Search, People } from '@mui/icons-material'

type GroupRow = {
  id: string
  title: string
  users: string
  type: string
}

interface GroupFormData {
  name: string
  type: 'static' | 'dynamic' | 'non-beamer'
  description: string
  selectedMembers: string[]
}

export default function GroupsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<GroupRow[]>([])
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    type: 'static',
    description: '',
    selectedMembers: [],
  })
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([])

  const columns = [
    { key: 'title' as keyof GroupRow, label: 'Title' },
    { key: 'users' as keyof GroupRow, label: 'Number of Users' },
    { key: 'type' as keyof GroupRow, label: 'Type' },
  ] as const

  // Load groups and users on mount
  useEffect(() => {
    fetchGroups()
    fetchUsers()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      
      // Always check localStorage first to get locally created groups
      let storedGroups: Group[] = []
      try {
        storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[]
        console.log('Found', storedGroups.length, 'groups in localStorage')
      } catch (e) {
        console.error('Error reading localStorage:', e)
      }
      
      // Try to fetch from API
      let apiGroups: Group[] = []
      try {
        apiGroups = await groupsApi.search()
        console.log('Fetched groups from API:', apiGroups.length)
      } catch (err: any) {
        console.warn('API fetch failed, using localStorage only:', err)
      }
      
      // Merge API groups and localStorage groups (localStorage takes priority for duplicates)
      const allGroupsMap = new Map<string, Group>()
      
      // Add API groups first
      apiGroups.forEach((group: Group) => {
        const id = group.id || group.objectId || ''
        if (id) {
          allGroupsMap.set(id, group)
        }
      })
      
      // Add localStorage groups (they override API groups if same ID)
      storedGroups.forEach((group: Group) => {
        const id = group.id || group.objectId || ''
        if (id) {
          allGroupsMap.set(id, group)
        }
      })
      
      // Convert map to array
      const allGroups = Array.from(allGroupsMap.values())
      console.log('Total groups to display:', allGroups.length)
      
      // Store groups in state
      setAllGroups(allGroups)
      
      // Map to display rows
      const mappedRows: GroupRow[] = allGroups.map((group: Group, index: number) => ({
        id: group.id || group.objectId || `group_${Date.now()}_${index}`,
        title: group.title || group.name || 'Untitled Group',
        users: String(group.users || group.members?.length || 0),
        type: group.type || 'organization',
      }))
      
      setRows(mappedRows)
      setMessage(null)
      
      // Update localStorage with merged groups
      try {
        localStorage.setItem('localGroups', JSON.stringify(allGroups))
      } catch (e) {
        console.error('Error saving to localStorage:', e)
      }
    } catch (err: any) {
      console.error('Failed to fetch groups:', err)
      // Load from localStorage as final fallback
      try {
        const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[]
        console.log('Fallback: Loading from localStorage:', storedGroups.length, 'groups')
        setAllGroups(storedGroups)
        const mappedRows: GroupRow[] = storedGroups.map((group: Group, index: number) => ({
          id: group.id || group.objectId || `group_${Date.now()}_${index}`,
          title: group.title || group.name || 'Untitled Group',
          users: String(group.users || group.members?.length || 0),
          type: group.type || 'organization',
        }))
        setRows(mappedRows)
      } catch (e) {
        console.error('Error loading groups from localStorage:', e)
        setRows([])
        setAllGroups([])
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for group members...')
      const users = await usersApi.list()
      console.log('Users fetched from API:', users?.length || 0)
      
      // Handle complex API response structure
      let userList: Array<{ id: string; name: string; email: string }> = []
      
      if (Array.isArray(users) && users.length > 0) {
        // Process each user - handle both processed User objects and raw nested API responses
        users.forEach((u: any, index: number) => {
          try {
            let userId = ''
            let firstName = ''
            let lastName = ''
            let email = ''
            
            // First, try to handle nested structure: { "objectId": [[{...}]] }
            // This is the raw API response format
            if (u && typeof u === 'object' && !Array.isArray(u)) {
              const keys = Object.keys(u)
              // Check if this looks like the nested structure with objectId as key
              if (keys.length > 0 && keys[0] && !isNaN(Number(keys[0]))) {
                // The key is the objectId (numeric string like "101262")
                userId = keys[0]
                
                // Extract nested array structure
                if (Array.isArray(u[userId])) {
                  const nestedArray = u[userId]
                  if (Array.isArray(nestedArray) && nestedArray.length > 0) {
                    let userData = null
                    if (Array.isArray(nestedArray[0])) {
                      // Structure: [[{...}]]
                      userData = nestedArray[0][0] || nestedArray[0]
                    } else {
                      // Structure: [{...}]
                      userData = nestedArray[0]
                    }
                    
                    if (userData) {
                      // Extract from nested structure
                      const persistent = userData.persistent || {}
                      const staticData = persistent.static || {}
                      const metadata = staticData.metadata || {}
                      const live = staticData.live || {}
                      const profile = live.profile || {}
                      
                      const notificationChannels = metadata.notificationChannels || {}
                      const emails = notificationChannels.emails || []
                      const phones = notificationChannels.phones || []
                      
                      email = (emails && emails.length > 0 && emails[0]) ? emails[0] : ''
                      firstName = profile?.firstName || ''
                      lastName = profile?.lastName || ''
                      
                      // Also check if objectId is in userData (should match the key)
                      if (userData.objectId) {
                        userId = String(userData.objectId)
                      }
                    }
                  }
                }
              }
            }
            
            // If not found in nested structure, check if this is already a processed User object
            if (!userId && u && (u.id || u.objectId)) {
              userId = String(u.id || u.objectId)
              firstName = u.firstName || ''
              lastName = u.lastName || ''
              email = u.email || ''
            }
            
            // Only add if we have at least an ID
            if (userId && userId !== 'undefined' && userId !== 'null' && userId.trim() !== '') {
              // Ensure userId is a string
              userId = String(userId).trim()
              
              // Build display name
              const fullName = `${firstName} ${lastName}`.trim()
              let displayName = fullName
              if (!displayName && email) {
                displayName = email.split('@')[0] // Use email username
              }
              if (!displayName) {
                displayName = `User ${userId}`
              }
              
              // Build display email
              let displayEmail = email
              if (!displayEmail || displayEmail.trim() === '') {
                displayEmail = `user_${userId}@beamdev.hu`
              }
              
              // Only add if we have a valid userId
              if (userId && userId !== 'id' && userId !== 'undefined' && userId !== 'null') {
                userList.push({
                  id: userId,
                  name: displayName,
                  email: displayEmail,
                })
              }
            }
          } catch (e) {
            console.warn('Error processing user:', e, u)
            // Try simple structure as fallback
            if (u && (u.id || u.email || u.objectId)) {
              const fallbackId = String(u.id || u.objectId || u.email || `user_${Date.now()}_${index}`)
              userList.push({
                id: fallbackId,
                name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || u.email || `User ${fallbackId}`,
                email: u.email || u.id || `user_${fallbackId}@beamdev.hu`,
              })
            }
          }
        })
      }
      
      console.log('Mapped user list:', userList.length, 'users')
      if (userList.length > 0) {
        console.log('Sample users:', userList.slice(0, 5))
      }
      
      if (userList.length > 0) {
        setAvailableUsers(userList)
      } else {
        // Try localStorage as fallback
        console.log('No users from API, checking localStorage...')
        try {
          const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]')
          console.log('Found', storedUsers.length, 'users in localStorage')
          
          const localUserList = storedUsers
            .filter((u: any, index: number) => u && (u.id || u.email || u.objectId))
            .map((u: any, index: number) => ({
              id: u.id || u.email || u.objectId || `user_${Date.now()}_${index}`,
              name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown User',
              email: u.email || u.id || 'No email',
            }))
            .filter((u: any) => u.id && u.id !== 'No email')
          
          if (localUserList.length > 0) {
            setAvailableUsers(localUserList)
            console.log('Using', localUserList.length, 'users from localStorage')
          }
        } catch (e) {
          console.error('Error parsing localStorage users:', e)
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      // Try localStorage as fallback
      try {
        const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]')
        console.log('Fallback: Found', storedUsers.length, 'users in localStorage')
        
        const userList = storedUsers
          .filter((u: any, index: number) => u && (u.id || u.email || u.objectId))
          .map((u: any, index: number) => ({
            id: u.id || u.email || u.objectId || `user_${Date.now()}_${index}`,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown User',
            email: u.email || u.id || 'No email',
          }))
          .filter((u: any) => u.id && u.id !== 'No email')
        
        setAvailableUsers(userList)
      } catch (e) {
        console.error('Error loading users from localStorage:', e)
        setAvailableUsers([])
      }
    }
  }

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const query = search.toLowerCase()
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(query) ||
        row.type.toLowerCase().includes(query) ||
        row.users.includes(query)
    )
  }, [rows, search])

  const handleAddGroup = (type: 'static' | 'dynamic' | 'non-beamer') => {
    setFormData({
      name: '',
      type: type,
      description: '',
      selectedMembers: [],
    })
    setSelectedGroup(null)
    setOpenDialog(true)
  }

  const handleSaveGroup = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Group name is required' })
      return
    }

    try {
      setMessage(null)
      const groupData = {
        name: formData.name.trim(),
        title: formData.name.trim(),
        type: formData.type,
        description: formData.description,
        members: formData.selectedMembers.map((userId) => {
          const user = availableUsers.find((u) => u.id === userId)
          return {
            userId: userId,
            email: user?.email || userId,
            name: user?.name || userId,
          }
        }),
      }

      let savedGroup: Group
      
      if (selectedGroup) {
        // Update existing group
        savedGroup = await groupsApi.update(selectedGroup.id || selectedGroup.objectId || '', groupData)
        setMessage({ type: 'success', text: 'Group updated successfully!' })
      } else {
        // Create new group
        savedGroup = await groupsApi.create(groupData)
        setMessage({ type: 'success', text: `Group "${formData.name}" created successfully!` })
      }

      // Refresh groups list
      setOpenDialog(false)
      await fetchGroups()
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      console.error('Failed to save group:', err)
      // Even if API fails, save to localStorage and refresh
      try {
        const newGroup: Group = {
          id: selectedGroup?.id || selectedGroup?.objectId || String(Date.now()),
          name: formData.name.trim(),
          title: formData.name.trim(),
          type: formData.type,
          description: formData.description,
          members: formData.selectedMembers.map((userId) => {
            const user = availableUsers.find((u) => u.id === userId)
            return {
              userId: userId,
              email: user?.email || userId,
              name: user?.name || userId,
            }
          }),
          users: formData.selectedMembers.length,
        }
        
        const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[]
        if (selectedGroup) {
          const index = storedGroups.findIndex(g => (g.id || g.objectId) === (selectedGroup.id || selectedGroup.objectId))
          if (index >= 0) {
            storedGroups[index] = newGroup
          }
        } else {
          storedGroups.push(newGroup)
        }
        localStorage.setItem('localGroups', JSON.stringify(storedGroups))
        
        setMessage({ type: 'success', text: `Group "${formData.name}" saved locally!` })
        setOpenDialog(false)
        await fetchGroups()
        setTimeout(() => setMessage(null), 3000)
      } catch (e) {
        setMessage({ type: 'error', text: 'Failed to save group: ' + (err.message || 'Unknown error') })
      }
    }
  }

  const handleEdit = async (row: GroupRow) => {
    const group = allGroups.find((g) => (g.id || g.objectId) === row.id)
    if (group) {
      setSelectedGroup(group)
      setFormData({
        name: group.title || group.name || '',
        type: (group.type as 'static' | 'dynamic' | 'non-beamer') || 'static',
        description: group.description || '',
        selectedMembers: (group.members || []).map((m: any) => {
          if (typeof m === 'string') return m
          return m.userId || m.id || m.email || ''
        }).filter((id: string) => id),
      })
      setOpenDialog(true)
    }
  }

  const handleDelete = async (row: GroupRow) => {
    const confirmed = window.confirm(`Delete group "${row.title}"?`)
    if (!confirmed || !row.id) return

    try {
      // Remove from localStorage
      try {
        const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[]
        const updatedGroups = storedGroups.filter((g) => (g.id || g.objectId) !== row.id)
        localStorage.setItem('localGroups', JSON.stringify(updatedGroups))
      } catch (e) {
        // Ignore localStorage errors
      }

      setRows((prev) => prev.filter((r) => r.id !== row.id))
      setAllGroups((prev) => prev.filter((g) => (g.id || g.objectId) !== row.id))
      setMessage({ type: 'success', text: 'Group deleted successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      console.error('Failed to delete group:', err)
      setMessage({ type: 'error', text: 'Failed to delete group: ' + (err.message || 'Unknown error') })
    }
  }

  const handleView = async (row: GroupRow) => {
    const group = allGroups.find((g) => (g.id || g.objectId) === row.id)
    if (group) {
      setSelectedGroup(group)
      setViewDialog(true)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'static':
        return 'primary'
      case 'dynamic':
        return 'secondary'
      case 'non-beamer':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Container maxWidth="xl" style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper elevation={0} style={{ padding: 24, background: '#fff' }}>
        <PageHeader
          title="Groups"
          right={
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search style={{ marginRight: 8, color: '#999' }} />,
                }}
                style={{ width: 250 }}
              />
              <Button
                variant="outlined"
                onClick={() => handleAddGroup('static')}
                style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
              >
                Add Static
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleAddGroup('dynamic')}
                style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
              >
                Add Dynamic
              </Button>
              <Button
                variant="contained"
                onClick={() => handleAddGroup('non-beamer')}
                style={{ background: 'var(--brand)', color: '#fff' }}
              >
                Add Non Beamer
              </Button>
            </Box>
          }
        />

        {message && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(null)}
            style={{ marginBottom: 16 }}
          >
            {message.text}
          </Alert>
        )}

        {loading ? (
          <Box style={{ textAlign: 'center', padding: 40 }}>
            <Typography>Loading groups...</Typography>
          </Box>
        ) : filteredRows.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: 40 }}>
            <Typography color="textSecondary">
              {search
                ? 'No groups found matching your search.'
                : 'No groups found. Create your first group!'}
            </Typography>
          </Box>
        ) : (
          <Box>
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #e6e6e6',
              }}
            >
              <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--brand)', color: '#fff' }}>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={`col-${String(col.key)}`}
                        align="left"
                        style={{ fontWeight: 700, fontSize: 13 }}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th align="center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={`row-${row.id}-${idx}`}
                      style={{
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleView(row)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <td style={{ fontSize: 13 }}>{row.title}</td>
                      <td style={{ fontSize: 13 }}>{row.users}</td>
                      <td style={{ fontSize: 13 }}>
                        <Chip
                          label={row.type}
                          size="small"
                          color={getTypeColor(row.type) as any}
                          style={{ fontSize: 11 }}
                        />
                      </td>
                      <td align="center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          onClick={() => handleEdit(row)}
                          style={{ marginRight: 4 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDelete(row)}
                          color="error"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {search && (
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                Showing {filteredRows.length} of {rows.length} groups
              </Typography>
            )}
          </Box>
        )}

        {/* Create/Edit Group Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedGroup ? 'Edit Group' : `Create ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Group`}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Grid item xs={12} key="name-field">
                <TextField
                  fullWidth
                  label="Group Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter group name"
                />
              </Grid>
              <Grid item xs={12} key="type-field">
                <FormControl fullWidth>
                  <InputLabel>Group Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Group Type"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'static' | 'dynamic' | 'non-beamer',
                      })
                    }
                    disabled={!!selectedGroup}
                  >
                    <MenuItem value="static">Static</MenuItem>
                    <MenuItem value="dynamic">Dynamic</MenuItem>
                    <MenuItem value="non-beamer">Non-Beamer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} key="description-field">
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Optional description for this group"
                />
              </Grid>
              <Grid item xs={12} key="members-field">
                <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 8 }}>
                  <Typography variant="subtitle2">
                    Add Members ({formData.selectedMembers.length} selected)
                  </Typography>
                  <Button
                    size="small"
                    onClick={fetchUsers}
                    style={{ fontSize: 12, textTransform: 'none' }}
                  >
                    🔄 Refresh Users
                  </Button>
                </Box>
                <Box
                  style={{
                    maxHeight: 200,
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 4,
                    padding: 8,
                    background: availableUsers.length === 0 ? '#f9f9f9' : '#fff',
                  }}
                >
                  {availableUsers.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: 20 }}>
                      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                        No users available.
                      </Typography>
                      <Typography variant="body2" color="textSecondary" style={{ fontSize: 12, marginBottom: 12 }}>
                        To add members, you need to create users first.
                      </Typography>
                      <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBottom: 8 }}>
                        Go to: <strong>People → Create User</strong> or <strong>People → Bulk Users</strong>
                      </Typography>
                      <Button
                        size="small"
                        onClick={fetchUsers}
                        variant="outlined"
                        style={{ marginTop: 8 }}
                      >
                        Refresh User List
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="caption" color="textSecondary" style={{ marginBottom: 8, display: 'block' }}>
                        {availableUsers.length} user{availableUsers.length !== 1 ? 's' : ''} available - Select users to add to this group
                      </Typography>
                      {availableUsers.map((user, userIndex) => (
                        <FormControlLabel
                          key={`user-${user.id}-${userIndex}`}
                          control={
                            <Checkbox
                              checked={formData.selectedMembers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    selectedMembers: [...formData.selectedMembers, user.id],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedMembers: formData.selectedMembers.filter((id) => id !== user.id),
                                  })
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" style={{ fontWeight: 500 }}>
                                {user.name || `User ${user.id}`}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {user.email || `ID: ${user.id}`}
                              </Typography>
                            </Box>
                          }
                          style={{ 
                            display: 'block', 
                            marginBottom: 4,
                            marginLeft: 0,
                            marginRight: 0,
                            padding: '4px 8px',
                            borderRadius: 4,
                            width: '100%',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveGroup} variant="contained" style={{ background: 'var(--brand)' }}>
              {selectedGroup ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Group Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <People />
              Group Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedGroup && (
              <Box>
                <Typography variant="h6" style={{ marginBottom: 16 }}>
                  {selectedGroup.title || selectedGroup.name || 'Untitled Group'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} key="type-display">
                    <Typography variant="body2" color="textSecondary">
                      Type
                    </Typography>
                    <Chip
                      label={selectedGroup.type || 'organization'}
                      size="small"
                      color={getTypeColor(selectedGroup.type || '') as any}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} key="members-count">
                    <Typography variant="body2" color="textSecondary">
                      Members
                    </Typography>
                    <Typography variant="body1">
                      {selectedGroup.members?.length || selectedGroup.users || 0} users
                    </Typography>
                  </Grid>
                  {selectedGroup.description && (
                    <Grid item xs={12} key="description-display">
                      <Typography variant="body2" color="textSecondary">
                        Description
                      </Typography>
                      <Typography variant="body1">{selectedGroup.description}</Typography>
                    </Grid>
                  )}
                  {selectedGroup.members && selectedGroup.members.length > 0 && (
                    <Grid item xs={12} key="member-list">
                      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                        Member List
                      </Typography>
                      <Box
                        style={{
                          maxHeight: 150,
                          overflowY: 'auto',
                          border: '1px solid #e0e0e0',
                          borderRadius: 4,
                          padding: 8,
                        }}
                      >
                        {selectedGroup.members.map((member: any, idx: number) => {
                          const memberId = typeof member === 'string' ? member : member.userId || member.id || member.email
                          const memberName = typeof member === 'string' ? member : member.name || member.email || memberId
                          const user = availableUsers.find((u) => u.id === memberId || u.email === memberId)
                          return (
                            <Typography key={`member-${memberId}-${idx}`} variant="body2" style={{ marginBottom: 4 }}>
                              {user?.name || memberName}
                            </Typography>
                          )
                        })}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
            {selectedGroup && (
              <Button
                onClick={() => {
                  setViewDialog(false)
                  const row = rows.find((r) => r.id === (selectedGroup.id || selectedGroup.objectId))
                  if (row) {
                    handleEdit(row)
                  }
                }}
                variant="contained"
                style={{ background: 'var(--brand)' }}
              >
                Edit
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  )
}
