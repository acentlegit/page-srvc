// Pages service for page management and messaging
export class PagesService {
  private apiBase: string;

  constructor() {
    // Read from .env file, fallback to staging backend
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://cudb-root-api.staging.beamdev.hu';
    const pathPrefix = import.meta.env.VITE_API_PATH_PREFIX || '/api';
    this.apiBase = `${baseUrl}${pathPrefix}/pages`;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // List all pages
  async listPages(): Promise<PageModel[]> {
    const response = await fetch(this.apiBase, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch pages: ${response.statusText}`);
    return response.json();
  }

  // Get single page
  async getPage(id: string): Promise<PageModel> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch page: ${response.statusText}`);
    return response.json();
  }

  // Create page
  async createPage(data: { type: string; name: string; members?: any[]; content?: any }): Promise<PageModel> {
    const response = await fetch(this.apiBase, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create page: ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  // Update page
  async updatePage(id: string, update: any): Promise<PageModel> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ update }),
    });
    if (!response.ok) throw new Error(`Failed to update page: ${response.statusText}`);
    return response.json();
  }

  // Delete page
  async deletePage(id: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete page: ${response.statusText}`);
    return response.json();
  }

  // Get messages for a page
  async getMessages(pageId: string): Promise<MessageModel[]> {
    const response = await fetch(`${this.apiBase}/${pageId}/messages`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch messages: ${response.statusText}`);
    return response.json();
  }

  // Create message
  async createMessage(pageId: string, userId: string, text: string): Promise<MessageModel> {
    const response = await fetch(`${this.apiBase}/${pageId}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, text }),
    });
    if (!response.ok) throw new Error(`Failed to create message: ${response.statusText}`);
    return response.json();
  }

  // Operate on page (add/remove members)
  async operatePage(pageId: string, operation: string, targetUserId: string, targetRole: string, actorUserId: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.apiBase}/${pageId}/operate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ operation, targetUserId, targetRole, actorUserId }),
    });
    if (!response.ok) throw new Error(`Failed to operate page: ${response.statusText}`);
    return response.json();
  }
}

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

// Export singleton instance
export const pagesService = new PagesService();
