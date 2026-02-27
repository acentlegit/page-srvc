import { apiCall } from './apiClient';

const BASE_URL = '/api/website-customization';

// Projects API
export const projectsApi = {
  list: async (customApplicationId?: string) => {
    try {
      const query = customApplicationId ? `?customApplicationId=${customApplicationId}` : '';
      return await apiCall<Array<{
        _id: string;
        id?: string;
        name: string;
        description: string;
        customApplicationId: string | { _id: string; name: string };
        employees: string[];
        pages: string[];
        createdAt: string;
        updatedAt: string;
      }>>(`${BASE_URL}/projects${query}`);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage
      console.log('Projects API unavailable, loading from localStorage (offline mode)');
      const stored = JSON.parse(localStorage.getItem('localProjects') || '[]');
      const filtered = customApplicationId 
        ? stored.filter((p: any) => p.customApplicationId === customApplicationId || (typeof p.customApplicationId === 'object' && p.customApplicationId._id === customApplicationId))
        : stored;
      return filtered;
    }
  },

  get: async (id: string) => {
    return apiCall<{
      _id: string;
      id?: string;
      name: string;
      description: string;
      customApplicationId: string | { _id: string; name: string };
      employees: string[];
      pages: string[];
      createdAt: string;
      updatedAt: string;
    }>(`${BASE_URL}/projects/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    customApplicationId: string;
    employees?: string[];
    pages?: string[];
  }) => {
    try {
      return await apiCall(`${BASE_URL}/projects`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Save to localStorage
      console.log('Projects API unavailable, saving to localStorage (offline mode)');
      const stored = JSON.parse(localStorage.getItem('localProjects') || '[]');
      const newProject = {
        _id: `project-${Date.now()}`,
        id: `project-${Date.now()}`,
        ...data,
        employees: data.employees || [],
        pages: data.pages || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      stored.push(newProject);
      localStorage.setItem('localProjects', JSON.stringify(stored));
      return newProject;
    }
  },

  update: async (id: string, data: {
    name?: string;
    description?: string;
    employees?: string[];
    pages?: string[];
  }) => {
    try {
      return await apiCall(`${BASE_URL}/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Update in localStorage
      console.log('Projects API unavailable, updating in localStorage (offline mode)');
      const stored = JSON.parse(localStorage.getItem('localProjects') || '[]');
      const index = stored.findIndex((p: any) => (p._id === id || p.id === id));
      if (index >= 0) {
        stored[index] = { ...stored[index], ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem('localProjects', JSON.stringify(stored));
        return stored[index];
      }
      throw new Error('Project not found');
    }
  },

  delete: async (id: string) => {
    try {
      return await apiCall(`${BASE_URL}/projects/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      // OFFLINE MODE: Delete from localStorage
      console.log('Projects API unavailable, deleting from localStorage (offline mode)');
      const stored = JSON.parse(localStorage.getItem('localProjects') || '[]');
      const filtered = stored.filter((p: any) => (p._id !== id && p.id !== id));
      localStorage.setItem('localProjects', JSON.stringify(filtered));
    }
  },
};

// Custom Applications API
export const customApplicationsApi = {
  list: async () => {
    try {
      return await apiCall<Array<{
        _id: string;
        id?: string;
        name: string;
        description: string;
        projects: string[];
        employees: string[];
        intakeForms: string[];
        pages: string[];
        createdAt: string;
        updatedAt: string;
      }>>(`${BASE_URL}/applications`);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage
      console.log('Custom applications API unavailable (offline mode), using localStorage');
      try {
        const stored = JSON.parse(localStorage.getItem('localCustomApplications') || '[]');
        return stored;
      } catch (localErr) {
        return [];
      }
    }
  },

  get: async (id: string) => {
    try {
      return await apiCall<{
        _id: string;
        id?: string;
        name: string;
        description: string;
        projects: string[];
        employees: string[];
        intakeForms: string[];
        pages: string[];
        createdAt: string;
        updatedAt: string;
      }>(`${BASE_URL}/applications/${id}`);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage
      console.log('Custom application API unavailable (offline mode), using localStorage');
      const stored = JSON.parse(localStorage.getItem('localCustomApplications') || '[]');
      const found = stored.find((a: any) => (a._id === id || a.id === id));
      if (found) return found;
      throw new Error('Application not found');
    }
  },

  create: async (data: {
    name: string;
    description?: string;
    projects?: string[];
    employees?: string[];
    intakeForms?: string[];
    pages?: string[];
  }) => {
    try {
      return await apiCall(`${BASE_URL}/applications`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Save to localStorage
      console.log('Custom applications API unavailable (offline mode), saving to localStorage');
      const stored = JSON.parse(localStorage.getItem('localCustomApplications') || '[]');
      const newApp = {
        _id: `app-${Date.now()}`,
        id: `app-${Date.now()}`,
        ...data,
        projects: data.projects || [],
        employees: data.employees || [],
        intakeForms: data.intakeForms || [],
        pages: data.pages || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      stored.push(newApp);
      localStorage.setItem('localCustomApplications', JSON.stringify(stored));
      return newApp;
    }
  },

  update: async (id: string, data: {
    name?: string;
    description?: string;
    projects?: string[];
    employees?: string[];
    intakeForms?: string[];
    pages?: string[];
  }) => {
    try {
      return await apiCall(`${BASE_URL}/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Update in localStorage
      console.log('Custom applications API unavailable (offline mode), updating in localStorage');
      const stored = JSON.parse(localStorage.getItem('localCustomApplications') || '[]');
      const index = stored.findIndex((a: any) => (a._id === id || a.id === id));
      if (index >= 0) {
        stored[index] = { ...stored[index], ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem('localCustomApplications', JSON.stringify(stored));
        return stored[index];
      }
      throw new Error('Application not found');
    }
  },

  delete: async (id: string) => {
    try {
      return await apiCall(`${BASE_URL}/applications/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      // OFFLINE MODE: Delete from localStorage
      console.log('Custom applications API unavailable (offline mode), deleting from localStorage');
      const stored = JSON.parse(localStorage.getItem('localCustomApplications') || '[]');
      const filtered = stored.filter((a: any) => (a._id !== id && a.id !== id));
      localStorage.setItem('localCustomApplications', JSON.stringify(filtered));
    }
  },
};

// Employees API
export const employeesApi = {
  list: async (customApplicationId?: string) => {
    try {
      const query = customApplicationId ? `?customApplicationId=${customApplicationId}` : '';
      return await apiCall<Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
        customApplicationId: string;
        projects: string[];
        createdAt: string;
        updatedAt: string;
      }>>(`${BASE_URL}/employees${query}`);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage
      console.log('Employees API unavailable, loading from localStorage (offline mode)');
      const stored = JSON.parse(localStorage.getItem('localEmployees') || '[]');
      const filtered = customApplicationId 
        ? stored.filter((e: any) => e.customApplicationId === customApplicationId)
        : stored;
      return filtered;
    }
  },

  get: async (id: string) => {
    return apiCall<{
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      customApplicationId: string;
      projects: string[];
      createdAt: string;
      updatedAt: string;
    }>(`${BASE_URL}/employees/${id}`);
  },

  create: async (data: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
    customApplicationId: string;
    projects?: string[];
  }) => {
    try {
      return await apiCall(`${BASE_URL}/employees`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Save to localStorage
      console.log('Employees API unavailable, saving to localStorage (offline mode)');
      const stored = JSON.parse(localStorage.getItem('localEmployees') || '[]');
      const newEmployee = {
        id: `employee-${Date.now()}`,
        ...data,
        phone: data.phone || '',
        role: data.role || 'employee',
        projects: data.projects || [],
        projectIds: data.projects || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      stored.push(newEmployee);
      localStorage.setItem('localEmployees', JSON.stringify(stored));
      return newEmployee;
    }
  },

  update: async (id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    projects?: string[];
  }) => {
    try {
      return await apiCall(`${BASE_URL}/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Update in localStorage
      console.log('Employees API unavailable, updating in localStorage (offline mode)');
      const stored = JSON.parse(localStorage.getItem('localEmployees') || '[]');
      const index = stored.findIndex((e: any) => e.id === id);
      if (index >= 0) {
        stored[index] = { 
          ...stored[index], 
          ...data, 
          projectIds: data.projects || stored[index].projectIds || [],
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem('localEmployees', JSON.stringify(stored));
        return stored[index];
      }
      throw new Error('Employee not found');
    }
  },

  delete: async (id: string) => {
    try {
      return await apiCall(`${BASE_URL}/employees/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      // OFFLINE MODE: Delete from localStorage
      console.log('Employees API unavailable, deleting from localStorage (offline mode)');
      const stored = JSON.parse(localStorage.getItem('localEmployees') || '[]');
      const filtered = stored.filter((e: any) => e.id !== id);
      localStorage.setItem('localEmployees', JSON.stringify(filtered));
    }
  },
};
