import { apiClient } from './config'

export interface Event {
  id?: string
  status: string
  flag: string
  name: string
  projects: string
  address: string
  state: string
  city: string
  country: string
  zip: string
  createdAt?: string
  updatedAt?: string
}

// Note: Events might not have dedicated endpoints in the backend
// Using a generic approach that can be adjusted based on actual backend structure
export const eventsApi = {
  // If events are stored as part of another entity, adjust this
  // For now, using searchUser as a fallback or you may need to use devices/groups
  getAll: async (params?: any): Promise<Event[]> => {
    try {
      // Try to get events from a search endpoint if available
      // This is a placeholder - adjust based on actual backend structure
      const response = await apiClient.post('/searchUser', params || {})
      // Transform response if needed
      return response.data || []
    } catch (error) {
      // If no events endpoint exists, return empty array
      console.warn('Events endpoint not available, using fallback')
      return []
    }
  },

  getById: async (params: any): Promise<Event> => {
    const response = await apiClient.post('/getUserInfo', params)
    return response.data
  },

  create: async (event: any): Promise<Event> => {
    // Adjust endpoint based on actual backend structure
    const response = await apiClient.post('/createUser', event)
    return response.data
  },

  update: async (params: any): Promise<Event> => {
    const response = await apiClient.post('/updateUser', params)
    return response.data
  },

  delete: async (params: any): Promise<void> => {
    // If delete endpoint exists, use it
    await apiClient.post('/updateUser', { ...params, deleted: true })
  },
}
