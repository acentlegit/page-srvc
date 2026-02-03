import { apiClient } from './config'

export interface LoginParams {
  username?: string
  password?: string
  [key: string]: any
}

export interface AuthResponse {
  token?: string
  user?: any
  [key: string]: any
}

export const authApi = {
  authenticate: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post('/authenticate', params)
    return response.data
  },

  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post('/login', params)
    // Store token if provided
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout', {})
    localStorage.removeItem('authToken')
  },

  register: async (params: any): Promise<any> => {
    const response = await apiClient.post('/register', params)
    return response.data
  },

  deregister: async (params: any): Promise<any> => {
    const response = await apiClient.post('/deregister', params)
    return response.data
  },

  validateRegistration: async (params: any): Promise<any> => {
    const response = await apiClient.post('/validateRegistration', params)
    return response.data
  },
}
