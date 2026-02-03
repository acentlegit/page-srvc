import { apiClient } from './config'

export const cudbsApi = {
  getCudbs: async (params?: any): Promise<any[]> => {
    const response = await apiClient.post('/getCudbs', params || {})
    return response.data
  },

  doBulk: async (params: any): Promise<any> => {
    const response = await apiClient.post('/doBulk', params)
    return response.data
  },
}
