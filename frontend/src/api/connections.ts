import { apiClient } from './config'

export const connectionsApi = {
  search: async (params: any): Promise<any[]> => {
    const response = await apiClient.post('/searchInConnection', params)
    return response.data
  },

  getAccount: async (params: any): Promise<any> => {
    const response = await apiClient.post('/getConnectionAccount', params)
    return response.data
  },

  update: async (params: any): Promise<any> => {
    const response = await apiClient.post('/updateConnection', params)
    return response.data
  },

  getAuthTypeAccount: async (params: any): Promise<any> => {
    const response = await apiClient.post('/getAuthTypeAccount', params)
    return response.data
  },
}
