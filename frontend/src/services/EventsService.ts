// Events service for event and project management
export class EventsService {
  private apiBase: string;

  constructor() {
    // Read from .env file, fallback to staging backend
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://cudb-root-api.staging.beamdev.hu';
    const pathPrefix = import.meta.env.VITE_API_PATH_PREFIX || '/api';
    this.apiBase = `${baseUrl}${pathPrefix}/events`;
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

  // List all events
  async listEvents(): Promise<Event[]> {
    try {
      const response = await fetch(this.apiBase, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 0 || response.status === 500) {
          throw new Error('Network error: Cannot connect to staging backend. Make sure you are connected to VPN.');
        }
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('Network')) {
        throw new Error(`Network error: Cannot reach staging backend (${this.apiBase}). Please check: 1) VPN connection, 2) Backend is accessible`);
      }
      throw err;
    }
  }

  // Get single event
  async getEvent(id: string): Promise<Event> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch event: ${response.statusText}`);
    return response.json();
  }

  // Create event
  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const response = await fetch(this.apiBase, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create event: ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  // Update event
  async updateEvent(id: string, update: Partial<Event>): Promise<Event> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(update),
    });
    if (!response.ok) throw new Error(`Failed to update event: ${response.statusText}`);
    return response.json();
  }

  // Delete event
  async deleteEvent(id: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.apiBase}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete event: ${response.statusText}`);
    return response.json();
  }

  // List all projects
  async listProjects(): Promise<Project[]> {
    const response = await fetch(`${this.apiBase}/projects`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);
    return response.json();
  }

  // Create project
  async createProject(project: Project): Promise<Project> {
    const response = await fetch(`${this.apiBase}/projects`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create project: ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  // Update project
  async updateProject(name: string, update: Partial<Project>): Promise<Project> {
    const response = await fetch(`${this.apiBase}/projects/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(update),
    });
    if (!response.ok) throw new Error(`Failed to update project: ${response.statusText}`);
    return response.json();
  }

  // Delete project
  async deleteProject(name: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.apiBase}/projects/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete project: ${response.statusText}`);
    return response.json();
  }
}

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

// Export singleton instance
export const eventsService = new EventsService();
