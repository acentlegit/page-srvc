import { apiClient } from './config'

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName?: string
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

export const tasksApi = {
  // Get all tasks (admin only)
  getAll: async (): Promise<Task[]> => {
    const response = await apiClient.post('/searchTask', {})
    return response.data || []
  },

  // Get tasks by staff member
  getByStaff: async (staffId: string): Promise<Task[]> => {
    const response = await apiClient.post('/searchTask', { assignedTo: staffId })
    return response.data || []
  },

  // Get task by ID
  getById: async (taskId: string): Promise<Task> => {
    const response = await apiClient.post('/getTaskInfo', { taskId })
    return response.data
  },

  // Create new task
  create: async (task: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post('/createTask', task)
    return response.data
  },

  // Update task
  update: async (taskId: string, update: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post('/updateTask', { taskId, ...update })
    return response.data
  },

  // Update task status
  updateStatus: async (taskId: string, status: Task['status']): Promise<Task> => {
    const response = await apiClient.post('/updateTask', { taskId, status })
    return response.data
  },

  // Delete task
  delete: async (taskId: string): Promise<void> => {
    await apiClient.post('/deleteTask', { taskId })
  },
}
