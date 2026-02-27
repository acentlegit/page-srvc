const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export const pageApi = {
  async listPages(): Promise<PageModel[]> {
    const res = await fetch(`${API_BASE_URL}/api/pages`);
    if (!res.ok) throw new Error(`Failed to fetch pages: ${res.statusText}`);
    return res.json();
  },

  async getPage(id: string): Promise<PageModel> {
    const res = await fetch(`${API_BASE_URL}/api/pages/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.statusText}`);
    return res.json();
  },

  async createPage(data: { type: string; name: string; members?: any[]; content?: any }): Promise<PageModel> {
    const res = await fetch(`${API_BASE_URL}/api/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create page: ${res.statusText}`);
    return res.json();
  },

  async updatePage(id: string, update: any): Promise<PageModel> {
    const res = await fetch(`${API_BASE_URL}/api/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ update }),
    });
    if (!res.ok) throw new Error(`Failed to update page: ${res.statusText}`);
    return res.json();
  },

  async getMessages(pageId: string): Promise<MessageModel[]> {
    const res = await fetch(`${API_BASE_URL}/api/pages/${pageId}/messages`);
    if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
    return res.json();
  },

  async createMessage(pageId: string, userId: string, text: string): Promise<MessageModel> {
    const res = await fetch(`${API_BASE_URL}/api/pages/${pageId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text }),
    });
    if (!res.ok) throw new Error(`Failed to create message: ${res.statusText}`);
    return res.json();
  },

  async operatePage(pageId: string, operation: string, targetUserId: string, targetRole: string, actorUserId: string): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/pages/${pageId}/operate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, targetUserId, targetRole, actorUserId }),
    });
    if (!res.ok) throw new Error(`Failed to operate page: ${res.statusText}`);
    return res.json();
  },
};
