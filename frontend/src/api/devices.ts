import { apiClient } from './config'

export interface Device {
  id?: string
  name?: string
  account?: any
  [key: string]: any
}

export interface SearchDeviceParams {
  query?: string
  [key: string]: any
}

export const devicesApi = {
  search: async (params: SearchDeviceParams): Promise<Device[]> => {
    const response = await apiClient.post('/searchDevice', params)
    return response.data
  },

  searchInDevice: async (params: any): Promise<any> => {
    const response = await apiClient.post('/searchInDevice', params)
    return response.data
  },

  update: async (params: any): Promise<Device> => {
    const response = await apiClient.post('/updateDevice', params)
    return response.data
  },

  sync: async (params: any): Promise<any> => {
    const response = await apiClient.post('/syncDevice', params)
    return response.data
  },

  getAccount: async (params: any): Promise<any> => {
    const response = await apiClient.post('/getDeviceAccount', params)
    return response.data
  },

  updateAccount: async (params: any): Promise<any> => {
    const response = await apiClient.post('/updateDeviceAccount', params)
    return response.data
  },

  getUserAndDeviceData: async (params: any): Promise<any> => {
    const response = await apiClient.post('/getUserAndDeviceData', params)
    return response.data
  },
}
