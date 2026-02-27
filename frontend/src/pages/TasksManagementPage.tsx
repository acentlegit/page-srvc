import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usersApi } from '../api/apiClient'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Add, Edit, CheckCircle, Cancel, Delete } from '@mui/icons-material'

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  customerId?: string
  customerName?: string
  pageId?: string
  pageName?: string
  formId?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  dueDate?: string
}

export default function TasksManagementPage() {
  const { user, hasRole } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    assignedTo: '',
    status: 'pending',
    priority: 'medium',
  })
  const [loading, setLoading] = useState(true)
  const [staffList, setStaffList] = useState<Array<{ id: string; email: string; name: string }>>([])
  const [pagesList, setPagesList] = useState<Array<{ id: string; name: string }>>([])

  const isAdmin = hasRole('admin')

  // Load staff list and pages for dropdowns
  useEffect(() => {
    const loadStaffAndPages = async () => {
      try {
        // Load all users
        const allUsers = await usersApi.list()
        
        // Filter for assignable users (staff, admin, manager, dispatcher, etc.)
        // Exclude customers/members who shouldn't receive tasks
        const staffUsers = allUsers
          .filter((u: any) => {
            const role = (u.role || '').toLowerCase()
            // Include roles that can receive tasks
            return role === 'staff' || 
                   role === 'admin' || 
                   role === 'manager' || 
                   role === 'dispatcher' ||
                   role === 'responder' ||
                   (role !== 'customer' && role !== 'member' && role !== '')
          })
          .map((u: any) => ({
            id: u.id || u.email,
            email: u.email,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          }))
        
        // If no staff found, include current user if admin
        if (staffUsers.length === 0 && isAdmin && user) {
          staffUsers.push({
            id: user.id || user.email || '',
            email: user.email || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Current User',
          })
        }
        
        console.log('Loaded staff users:', staffUsers.length, staffUsers)
        setStaffList(staffUsers)

        // Load pages for customer/page selection
        const { pagesApi } = await import('../api/apiClient')
        const allPages = await pagesApi.list()
        const pages = allPages.map((p: any) => ({
          id: p.id,
          name: p.name || 'Untitled Page',
        }))
        setPagesList(pages)
      } catch (err) {
        console.error('Failed to load staff/pages:', err)
        // Fallback to localStorage
        try {
          const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]')
          const staffUsers = localUsers
            .filter((u: any) => {
              const role = (u.role || '').toLowerCase()
              return role === 'staff' || 
                     role === 'admin' || 
                     role === 'manager' || 
                     role === 'dispatcher' ||
                     role === 'responder' ||
                     (role !== 'customer' && role !== 'member' && role !== '')
            })
            .map((u: any) => ({
              id: u.id || u.email,
              email: u.email,
              name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
            }))
          
          // If still no staff, include current user if admin
          if (staffUsers.length === 0 && isAdmin && user) {
            staffUsers.push({
              id: user.id || user.email || '',
              email: user.email || '',
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Current User',
            })
          }
          
          console.log('Loaded staff from localStorage:', staffUsers.length, staffUsers)
          setStaffList(staffUsers)

          const localPages = JSON.parse(localStorage.getItem('localPages') || '[]')
          const pages = localPages.map((p: any) => ({
            id: p.id,
            name: p.name || 'Untitled Page',
          }))
          setPagesList(pages)
        } catch (e) {
          console.warn('Failed to load from localStorage:', e)
          // Last resort: add current user if admin
          if (isAdmin && user) {
            setStaffList([{
              id: user.id || user.email || '',
              email: user.email || '',
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Current User',
            }])
          }
        }
      }
    }

    loadStaffAndPages()
  }, [user, isAdmin])

  useEffect(() => {
    fetchTasks()
  }, [user, isAdmin])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      
      // Try API first
      try {
        const { tasksApi } = await import('../api/tasks')
        const fetchedTasks = isAdmin 
          ? await tasksApi.getAll()
          : await tasksApi.getByStaff(user?.id || '')
        
        if (fetchedTasks && fetchedTasks.length > 0) {
          // Ensure all tasks have required fields
          const normalizedTasks = fetchedTasks.map(task => ({
            ...task,
            assignedToName: task.assignedToName || '',
            customerName: task.customerName || '',
            pageName: task.pageName || '',
          }))
          setTasks(normalizedTasks)
          // Also save to localStorage
          localStorage.setItem('localTasks', JSON.stringify(fetchedTasks))
          setLoading(false)
          return
        }
      } catch (apiErr: any) {
        // API failed, use localStorage
        console.log('API unavailable, using localStorage for tasks')
      }

      // Load from localStorage
      try {
        const storedTasks = JSON.parse(localStorage.getItem('localTasks') || '[]') as Task[]
        
        // Filter tasks based on role
        let filteredTasks = storedTasks
        if (!isAdmin && user?.id) {
          // Staff sees only tasks assigned to them
          filteredTasks = storedTasks.filter(task => 
            task.assignedTo === user.id || 
            task.assignedTo === user.email ||
            task.assignedTo?.toLowerCase() === user.email?.toLowerCase()
          )
        }
        
        // Enrich with names
        const enrichedTasks = await enrichTasksWithNames(filteredTasks)
        setTasks(enrichedTasks)
      } catch (err) {
        console.error('Failed to load tasks from localStorage:', err)
        setTasks([])
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Enrich tasks with user/page names
  const enrichTasksWithNames = async (taskList: Task[]): Promise<Task[]> => {
    try {
      // Load all users for name lookup
      const allUsers = await usersApi.list()
      const userMap = new Map<string, string>()
      allUsers.forEach((u: any) => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
        if (u.id) userMap.set(u.id, name)
        if (u.email) userMap.set(u.email, name)
      })

      // Also check localStorage
      try {
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]')
        localUsers.forEach((u: any) => {
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
          if (u.id) userMap.set(u.id, name)
          if (u.email) userMap.set(u.email, name)
        })
      } catch (e) {
        // Ignore
      }

      // Load pages for name lookup
      const { pagesApi } = await import('../api/apiClient')
      const allPages = await pagesApi.list()
      const pageMap = new Map<string, string>()
      allPages.forEach((p: any) => {
        if (p.id) pageMap.set(p.id, p.name || 'Untitled Page')
      })

      return taskList.map(task => ({
        ...task,
        assignedToName: task.assignedTo ? (userMap.get(task.assignedTo) || task.assignedTo) : 'Unassigned',
        customerName: task.customerId ? (userMap.get(task.customerId) || task.customerId) : undefined,
        pageName: task.pageId ? (pageMap.get(task.pageId) || task.pageId) : undefined,
      }))
    } catch (err) {
      console.warn('Failed to enrich tasks with names:', err)
      return taskList
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      status: 'pending',
      priority: 'medium',
    })
    setOpenDialog(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setFormData(task)
    setOpenDialog(true)
  }

  const handleSaveTask = async () => {
    if (!formData.title?.trim()) {
      window.alert('Please enter a task title')
      return
    }

    if (!formData.assignedTo) {
      window.alert('Please assign the task to a staff member')
      return
    }

    try {
      const taskData: Task = {
        id: editingTask?.id || `task-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        title: formData.title.trim(),
        description: formData.description || '',
        assignedTo: formData.assignedTo,
        assignedToName: staffList.find(s => s.id === formData.assignedTo)?.name || formData.assignedTo,
        customerId: formData.customerId,
        customerName: formData.customerName,
        pageId: formData.pageId,
        pageName: formData.pageName,
        status: formData.status || 'pending',
        priority: formData.priority || 'medium',
        createdAt: editingTask?.createdAt || new Date().toISOString(),
        dueDate: formData.dueDate,
      }

      // Try API first
      try {
        const { tasksApi } = await import('../api/tasks')
        if (editingTask) {
          await tasksApi.update(editingTask.id, taskData)
        } else {
          await tasksApi.create(taskData)
        }
      } catch (apiErr: any) {
        // API failed, use localStorage
        console.log('API unavailable, saving to localStorage')
      }

      // Save to localStorage
      const storedTasks = JSON.parse(localStorage.getItem('localTasks') || '[]') as Task[]
      if (editingTask) {
        const index = storedTasks.findIndex(t => t.id === editingTask.id)
        if (index >= 0) {
          storedTasks[index] = taskData
        } else {
          storedTasks.push(taskData)
        }
      } else {
        storedTasks.push(taskData)
      }
      localStorage.setItem('localTasks', JSON.stringify(storedTasks))

      await fetchTasks()
      setOpenDialog(false)
      window.alert(editingTask ? 'Task updated successfully!' : 'Task created successfully!')
    } catch (err: any) {
      console.error('Failed to save task:', err)
      window.alert(`Failed to save task: ${err.message || 'Unknown error'}`)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      // Try API first
      try {
        const { tasksApi } = await import('../api/tasks')
        await tasksApi.updateStatus(taskId, newStatus)
      } catch (apiErr: any) {
        // API failed, use localStorage
        console.log('API unavailable, updating in localStorage')
      }

      // Update in localStorage
      const storedTasks = JSON.parse(localStorage.getItem('localTasks') || '[]') as Task[]
      const index = storedTasks.findIndex(t => t.id === taskId)
      if (index >= 0) {
        storedTasks[index].status = newStatus
        localStorage.setItem('localTasks', JSON.stringify(storedTasks))
      }

      await fetchTasks()
    } catch (err: any) {
      console.error('Failed to update task status:', err)
      window.alert(`Failed to update task status: ${err.message || 'Unknown error'}`)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      // Try API first
      try {
        const { tasksApi } = await import('../api/tasks')
        await tasksApi.delete(taskId)
      } catch (apiErr: any) {
        // API failed, use localStorage
        console.log('API unavailable, deleting from localStorage')
      }

      // Delete from localStorage
      const storedTasks = JSON.parse(localStorage.getItem('localTasks') || '[]') as Task[]
      const updatedTasks = storedTasks.filter(t => t.id !== taskId)
      localStorage.setItem('localTasks', JSON.stringify(updatedTasks))

      await fetchTasks()
      window.alert('Task deleted successfully!')
    } catch (err: any) {
      console.error('Failed to delete task:', err)
      window.alert(`Failed to delete task: ${err.message || 'Unknown error'}`)
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'info'
      case 'cancelled': return 'error'
      default: return 'warning'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      default: return 'default'
    }
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: 20 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Task Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin ? 'Manage and assign tasks to staff' : 'View and update your assigned tasks'}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Assigned To</TableCell>
              {isAdmin && <TableCell>Customer/Page</TableCell>}
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.assignedToName}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      {task.customerName || task.pageName || 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      size="small"
                      color={getStatusColor(task.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    {task.dueDate 
                      ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {!isAdmin && task.status !== 'completed' && task.status !== 'cancelled' && (
                        <>
                          {task.status === 'pending' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<CheckCircle />}
                              onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                            >
                              Start
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleUpdateStatus(task.id, 'completed')}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  label="Assigned To"
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Select Staff</em>
                  </MenuItem>
                  {staffList.length === 0 ? (
                    <MenuItem value="" disabled>
                      No staff members found. Create staff users first.
                    </MenuItem>
                  ) : (
                    staffList.map((staff) => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.name} {staff.email !== staff.name ? `(${staff.email})` : ''}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {staffList.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                    Tip: Create users with roles: admin, manager, staff, dispatcher, or responder
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {isAdmin && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Customer/Page (Optional)</InputLabel>
                    <Select
                      value={formData.pageId || ''}
                      label="Customer/Page (Optional)"
                      onChange={(e) => {
                        const pageId = e.target.value
                        const selectedPage = pagesList.find(p => p.id === pageId)
                        setFormData({ 
                          ...formData, 
                          pageId: pageId || undefined,
                          pageName: selectedPage?.name
                        })
                      }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {pagesList.map((page) => (
                        <MenuItem key={page.id} value={page.id}>
                          {page.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate ? (formData.dueDate.includes('T') ? formData.dueDate.split('T')[0] : formData.dueDate) : ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || undefined })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained">
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
