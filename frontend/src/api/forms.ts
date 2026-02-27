import { apiClient } from './config'

export interface C2MForm {
  id: string
  title: string
  description: string
  category?: string
  customerId: string
  customerEmail: string
  pdfFileUrl?: string
  status: 'pending' | 'reviewing' | 'resolved' | 'closed'
  assignedTo?: string
  assignedToName?: string
  createdAt: string
  updatedAt?: string
}

export const c2mFormsApi = {
  // Submit a new form
  submit: async (formData: {
    title: string
    description: string
    category?: string
    customerId: string
    customerEmail: string
    pdfFile?: File
  }): Promise<C2MForm> => {
    const formPayload = new FormData()
    formPayload.append('title', formData.title)
    formPayload.append('description', formData.description)
    formPayload.append('customerId', formData.customerId)
    formPayload.append('customerEmail', formData.customerEmail)
    if (formData.category) {
      formPayload.append('category', formData.category)
    }
    if (formData.pdfFile) {
      formPayload.append('pdfFile', formData.pdfFile)
    }

    const response = await apiClient.post('/submitC2MForm', formPayload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get all forms (admin/staff)
  getAll: async (): Promise<C2MForm[]> => {
    const response = await apiClient.post('/searchC2MForm', {})
    return response.data || []
  },

  // Get forms by customer
  getByCustomer: async (customerId: string): Promise<C2MForm[]> => {
    const response = await apiClient.post('/searchC2MForm', { customerId })
    return response.data || []
  },

  // Get form by ID
  getById: async (formId: string): Promise<C2MForm> => {
    const response = await apiClient.post('/getC2MFormInfo', { formId })
    return response.data
  },

  // Update form (assign, update status)
  update: async (formId: string, update: Partial<C2MForm>): Promise<C2MForm> => {
    const response = await apiClient.post('/updateC2MForm', { formId, ...update })
    return response.data
  },
}
