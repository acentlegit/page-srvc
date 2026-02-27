import { STAGING_API_BASE_URL, getAuthHeaders } from './config';

// Use staging backend (manager's backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || STAGING_API_BASE_URL;

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

export const usersApiRest = {
  async listUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
    return res.json();
  },

  async getUser(id: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch user: ${res.statusText}`);
    return res.json();
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create user: ${res.statusText} - ${errorText}`);
    }
    return res.json();
  },

  async updateUser(id: string, update: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error(`Failed to update user: ${res.statusText}`);
    return res.json();
  },

  async deleteUser(id: string): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete user: ${res.statusText}`);
    return res.json();
  },

  async searchUsers(query: string): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to search users: ${res.statusText}`);
    return res.json();
  },
};
