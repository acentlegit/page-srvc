import { apiClient } from './config'

export interface User {
  id?: string
  flag?: string
  blocked: string
  firstName: string
  lastName: string
  customId: string
  role: string
  phone: string
  email: string
  beamId: string
}

export const usersApi = {
  // Search users - returns array of users
  getAll: async (params?: any): Promise<User[]> => {
    const response = await apiClient.post('/searchUser', params || {})
    return response.data || []
  },

  // Search within users
  searchIn: async (params: any): Promise<User[]> => {
    const response = await apiClient.post('/searchInUser', params)
    return response.data || []
  },

  // Get user by ID or account info
  getById: async (params: any): Promise<User> => {
    const response = await apiClient.post('/getUserInfo', params)
    return response.data
  },

  // Get user account
  getAccount: async (params: any): Promise<any> => {
    const response = await apiClient.post('/getUserAccount', params)
    return response.data
  },

  // Create new user
  create: async (user: any): Promise<User> => {
    const response = await apiClient.post('/createUser', user)
    return response.data
  },

  // Update user
  update: async (params: any): Promise<User> => {
    const response = await apiClient.post('/updateUser', params)
    return response.data
  },

  // Update user account
  updateAccount: async (params: any): Promise<any> => {
    const response = await apiClient.post('/updateUserAccount', params)
    return response.data
  },

  // Sync user
  sync: async (params: any): Promise<any> => {
    const response = await apiClient.post('/syncUser', params)
    return response.data
  },
}
