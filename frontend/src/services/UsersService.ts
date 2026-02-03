// Users service for user management
export class UsersService {
  private apiBase: string;

  constructor() {
    // Read from .env file, fallback to staging backend
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://cudb-root-api.staging.beamdev.hu';
    const pathPrefix = import.meta.env.VITE_API_PATH_PREFIX || '/api';
    this.apiBase = `${baseUrl}${pathPrefix}/users`;
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

  // List all users
  async listUsers(): Promise<User[]> {
    const response = await fetch(this.apiBase, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
    return response.json();
  }

  // Get single user
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch user: ${response.statusText}`);
    return response.json();
  }

  // Create user
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(this.apiBase, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user: ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  // Update user
  async updateUser(id: string, update: Partial<User>): Promise<User> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(update),
    });
    if (!response.ok) throw new Error(`Failed to update user: ${response.statusText}`);
    return response.json();
  }

  // Delete user
  async deleteUser(id: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete user: ${response.statusText}`);
    return response.json();
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to search users: ${response.statusText}`);
    return response.json();
  }
}

export interface User {
  id: string;
  flag?: string;
  blocked: string;
  firstName: string;
  lastName: string;
  customId: string;
  role: string;
  phone: string;
  email: string;
  beamId: string;
  status?: string;
}

// Export singleton instance
export const usersService = new UsersService();
