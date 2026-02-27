import { STAGING_API_BASE_URL, getAuthHeaders } from './config';

// Use staging backend (manager's backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || STAGING_API_BASE_URL;

export interface Event {
  id: string;
  status: string;
  flag: string;
  name: string;
  projects: string;
  address: string;
  state: string;
  city: string;
  country: string;
  zip: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  name: string;
  description: string;
  owner?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const eventsApiRest = {
  async listEvents(): Promise<Event[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/events`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        if (res.status === 0 || res.status === 500) {
          throw new Error(`Network error: Cannot connect to staging backend. Make sure you are connected to VPN.`);
        }
        throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
      }
      return res.json();
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('Network')) {
        throw new Error(`Network error: Cannot reach staging backend (${API_BASE_URL}). Please check: 1) VPN connection, 2) Backend is accessible`);
      }
      throw err;
    }
  },

  async getEvent(id: string): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch event: ${res.statusText}`);
    return res.json();
  },

  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create event: ${res.statusText} - ${errorText}`);
    }
    return res.json();
  },

  async updateEvent(id: string, update: Partial<Event>): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error(`Failed to update event: ${res.statusText}`);
    return res.json();
  },

  async deleteEvent(id: string): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete event: ${res.statusText}`);
    return res.json();
  },

  async listProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE_URL}/events/projects`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);
    return res.json();
  },

  async createProject(project: Project): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/events/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create project: ${res.statusText} - ${errorText}`);
    }
    return res.json();
  },

  async updateProject(name: string, update: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/events/projects/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error(`Failed to update project: ${res.statusText}`);
    return res.json();
  },

  async deleteProject(name: string): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE_URL}/events/projects/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete project: ${res.statusText}`);
    return res.json();
  },
};
