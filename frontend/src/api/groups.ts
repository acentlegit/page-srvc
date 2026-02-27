import { apiClient } from './config'

export interface Group {
  id?: string
  name?: string
  account?: any
  [key: string]: any
}

export const groupsApi = {
  search: async (params: any): Promise<Group[]> => {
    const response = await apiClient.post('/searchGroup', params)
    return response.data
  },

  getAccount: async (params: any): Promise<any> => {
    const response = await apiClient.post('/getGroupAccount', params)
    return response.data
  },

  update: async (params: any): Promise<Group> => {
    const response = await apiClient.post('/updateGroup', params)
    return response.data
  },

  updateAccount: async (params: any): Promise<any> => {
    const response = await apiClient.post('/updateGroupAccount', params)
    return response.data
  },
}
