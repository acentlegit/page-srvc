import { mqttService } from './mqtt-client'

// Page types based on the backend structure
export type PageRole = 'Owner' | 'Admin' | 'Member'
export type PageType = 'LiveFriend' | 'LiveGroup' | 'LiveMember'

export interface PageMember {
  userId: string
  role: PageRole
}

export interface Page {
  id: string
  type: PageType
  name: string
  members: PageMember[]
  connections: Record<string, any>
  content?: any
  createdAt: number
  updatedAt: number
}

export interface PageMessage {
  messageId: string
  pageId: string
  userId: string
  text: string
  createdAt: number
}

// MQTT Topics
const Topics = {
  AggregatePage: 'service/page/TopicBody.AggregatePage',
  CreatePage: 'service/page/TopicBody.CreatePage',
  GetPage: 'service/page/TopicBody.GetPage',
  UpdatePage: 'service/page/TopicBody.UpdatePage',
  ConnectPage: 'service/page/TopicBody.ConnectPage',
  DisconnectPage: 'service/page/TopicBody.DisconnectPage',
  AggregateMessage: 'service/page/TopicBody.AggregateMessage',
  OperatePage: 'service/page/TopicBody.OperatePage',
}

// MQTT-based Pages API
export const pagesApi = {
  // Get all pages
  getAll: async (actorUserId: string = 'admin'): Promise<Page[]> => {
    try {
      const pages = await mqttService.request<Page[]>(Topics.AggregatePage, {}, actorUserId)
      return Array.isArray(pages) ? pages : []
    } catch (error) {
      console.error('Failed to get pages:', error)
      return []
    }
  },

  // Get page by ID
  getById: async (pageId: string, actorUserId: string = 'admin'): Promise<Page> => {
    return mqttService.request<Page>(Topics.GetPage, { pageId }, actorUserId)
  },

  // Create new page
  create: async (page: { type: PageType; name: string; members?: PageMember[]; content?: any }, actorUserId: string = 'admin'): Promise<Page> => {
    return mqttService.request<Page>(Topics.CreatePage, page, actorUserId)
  },

  // Update page
  update: async (pageId: string, update: Partial<Pick<Page, 'name' | 'type' | 'members' | 'connections' | 'content'>>, actorUserId: string = 'admin'): Promise<Page> => {
    return mqttService.request<Page>(Topics.UpdatePage, { pageId, update }, actorUserId)
  },

  // Delete page (update with archived flag or remove)
  delete: async (pageId: string, actorUserId: string = 'admin'): Promise<void> => {
    // Pages don't have a delete endpoint, so we might need to handle this differently
    // For now, we'll just update the page name to indicate it's deleted
    await mqttService.request(Topics.UpdatePage, { pageId, update: { name: `[DELETED] ${pageId}` } }, actorUserId)
  },

  // Add member to page
  addMember: async (pageId: string, userId: string, role: PageRole = 'Member', actorUserId: string = 'admin'): Promise<Page> => {
    await mqttService.request(Topics.OperatePage, {
      pageId,
      operation: 'AddMember',
      targetUserId: userId,
      targetRole: role,
    }, actorUserId)
    return pagesApi.getById(pageId, actorUserId)
  },

  // Remove member from page
  removeMember: async (pageId: string, userId: string, actorUserId: string = 'admin'): Promise<Page> => {
    await mqttService.request(Topics.OperatePage, {
      pageId,
      operation: 'RemoveMember',
      targetUserId: userId,
    }, actorUserId)
    return pagesApi.getById(pageId, actorUserId)
  },

  // Get messages for a page
  getMessages: async (pageId: string, actorUserId: string = 'admin'): Promise<PageMessage[]> => {
    const messages = await mqttService.request<PageMessage[]>(Topics.AggregateMessage, { pageId }, actorUserId)
    return Array.isArray(messages) ? messages : []
  },

  // Send message to page (Note: This might need a different endpoint - check backend)
  sendMessage: async (pageId: string, userId: string, text: string, actorUserId: string = 'admin'): Promise<PageMessage> => {
    // The backend might need a createMessage endpoint - for now using operatePage pattern
    // You may need to add this endpoint to the backend
    return mqttService.request<PageMessage>(Topics.AggregateMessage, { pageId, userId, text }, actorUserId)
  },

  // Connect user to page (for presence/real-time)
  connect: async (params: { pageId: string; userId: string; udid?: string; cudbServiceId?: string; groups?: string[] }, actorUserId: string = 'admin'): Promise<{ connectionId: string }> => {
    return mqttService.request<{ connectionId: string }>(Topics.ConnectPage, params, actorUserId)
  },

  // Disconnect user from page
  disconnect: async (pageId: string, connectionId: string, actorUserId: string = 'admin'): Promise<{ ok: boolean }> => {
    return mqttService.request<{ ok: boolean }>(Topics.DisconnectPage, { pageId, connectionId }, actorUserId)
  },

  // Subscribe to page events
  subscribeToPageEvents: (pageId: string, onEvent: (event: any) => void) => {
    const eventTopics = [
      `service/page/events/PageUpdated/${pageId}`,
      `service/page/events/ConnectionsUpdated/${pageId}`,
      `service/page/events/PresenceUpdated/${pageId}`,
      `service/page/events/MessageCreated/${pageId}`,
    ]
    
    eventTopics.forEach(topic => {
      mqttService.subscribe(topic, onEvent)
    })
  },
}
