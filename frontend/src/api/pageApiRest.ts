import { STAGING_API_BASE_URL, getAuthHeaders } from './config';

// Use staging backend (manager's backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || STAGING_API_BASE_URL;

export type PageModel = {
  id: string;
  type: 'LiveFriend' | 'LiveGroup' | 'LiveMember';
  name: string;
  members: Array<{ userId: string; role: 'Owner' | 'Admin' | 'Member' }>;
  connections: Record<string, any>;
  content?: any;
  createdAt: number;
  updatedAt: number;
};

export type MessageModel = {
  messageId: string;
  pageId: string;
  userId: string;
  text: string;
  createdAt: number;
};

export const pageApiRest = {
  async listPages(): Promise<PageModel[]> {
    const res = await fetch(`${API_BASE_URL}/pages`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch pages: ${res.statusText}`);
    return res.json();
  },

  async getPage(id: string): Promise<PageModel> {
    const res = await fetch(`${API_BASE_URL}/pages/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.statusText}`);
    return res.json();
  },

  async createPage(data: { type: string; name: string; members?: any[]; content?: any }): Promise<PageModel> {
    const res = await fetch(`${API_BASE_URL}/pages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create page: ${res.statusText} - ${errorText}`);
    }
    return res.json();
  },

  async updatePage(id: string, update: any): Promise<PageModel> {
    const res = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ update }),
    });
    if (!res.ok) throw new Error(`Failed to update page: ${res.statusText}`);
    return res.json();
  },

  async deletePage(id: string): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete page: ${res.statusText}`);
    return res.json();
  },

  async getMessages(pageId: string): Promise<MessageModel[]> {
    const res = await fetch(`${API_BASE_URL}/pages/${pageId}/messages`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
    return res.json();
  },

  async createMessage(pageId: string, userId: string, text: string): Promise<MessageModel> {
    const res = await fetch(`${API_BASE_URL}/pages/${pageId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, text }),
    });
    if (!res.ok) throw new Error(`Failed to create message: ${res.statusText}`);
    return res.json();
  },

  async operatePage(pageId: string, operation: string, targetUserId: string, targetRole: string, actorUserId: string): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE_URL}/pages/${pageId}/operate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ operation, targetUserId, targetRole, actorUserId }),
    });
    if (!res.ok) throw new Error(`Failed to operate page: ${res.statusText}`);
    return res.json();
  },
};
