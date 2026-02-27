import axios from 'axios'

// Staging backend URL (manager's backend)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cudb-root-api.staging.beamdev.hu'
// API path prefix - staging backend uses /api prefix
const API_PATH_PREFIX = import.meta.env.VITE_API_PATH_PREFIX || '/api'

// Export base URL for use in fetch-based API clients
export const STAGING_API_BASE_URL = `${API_BASE_URL}${API_PATH_PREFIX}`

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PATH_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const method = error.config?.method?.toUpperCase()
    
    // Suppress 404 errors for expected missing endpoints (staging backend)
    if (status === 404) {
      // Only log in development, and only for unexpected endpoints
      const expected404Endpoints = ['/login', '/logout', '/register', '/createUser', '/searchPage', '/searchMessage', '/searchInPage', '/events']
      const isExpected404 = expected404Endpoints.some(endpoint => url?.includes(endpoint))
      
      if (!isExpected404 || process.env.NODE_ENV === 'development') {
        // Silent for expected 404s in production
        if (isExpected404 && process.env.NODE_ENV === 'production') {
          // Suppress expected 404s in production
        } else {
          console.warn(`Endpoint not found: ${method} ${url}. Check if the endpoint path is correct.`)
        }
      }
    } else {
      // Log other errors normally
      console.error(`API Error [${method} ${url}]:`, {
        status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      })
    }
    
    // Provide more helpful error messages
    if (status === 404) {
      // Already handled above
    } else if (status === 401) {
      console.warn('Authentication required. You may need to login first.')
      // Optionally redirect to login or show login modal
    } else if (status === 403) {
      console.warn('Access forbidden. Check your permissions.')
    } else if (status === 0 || error.message === 'Network Error') {
      console.error('Network error. Make sure you are connected to VPN and the staging backend is accessible.')
    }
    
    return Promise.reject(error)
  }
)

// Helper function to get auth headers for fetch requests
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  const token = localStorage.getItem('authToken')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}
