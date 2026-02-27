import { apiClient } from './config'

export interface AIAgent {
  id: string
  name: string
  description: string
  systemPrompt: string
  enabled: boolean
  assignedPages: string[]
  createdAt: string
  updatedAt?: string
}

export const aiAgentsApi = {
  // Get all AI agents
  getAll: async (): Promise<AIAgent[]> => {
    const response = await apiClient.post('/searchAIAgent', {})
    return response.data || []
  },

  // Get AI agent by ID
  getById: async (agentId: string): Promise<AIAgent> => {
    const response = await apiClient.post('/getAIAgentInfo', { agentId })
    return response.data
  },

  // Create new AI agent
  create: async (agent: Partial<AIAgent>): Promise<AIAgent> => {
    const response = await apiClient.post('/createAIAgent', agent)
    return response.data
  },

  // Update AI agent
  update: async (agentId: string, update: Partial<AIAgent>): Promise<AIAgent> => {
    const response = await apiClient.post('/updateAIAgent', { agentId, ...update })
    return response.data
  },

  // Delete AI agent
  delete: async (agentId: string): Promise<void> => {
    await apiClient.post('/deleteAIAgent', { agentId })
  },

  // Assign agent to page
  assignToPage: async (agentId: string, pageId: string): Promise<AIAgent> => {
    const response = await apiClient.post('/assignAIAgentToPage', { agentId, pageId })
    return response.data
  },

  // Remove agent from page
  removeFromPage: async (agentId: string, pageId: string): Promise<AIAgent> => {
    const response = await apiClient.post('/removeAIAgentFromPage', { agentId, pageId })
    return response.data
  },
}
