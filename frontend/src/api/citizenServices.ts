// API client for Citizen Services Intake System
import { apiCall } from './apiClient';
import type {
  FormTemplate,
  IntakeForm,
  Citizen,
  IntakeSubmission,
  SubmissionData,
  Program,
  ProgramApplication,
  AnalyticsOverview,
  ProgramStatistics,
  DemographicsBreakdown,
  FormField,
} from '../types/citizenServices';

const BASE_PATH = '/api/custom-applications/citizen-services';

// Form Builder APIs
export const intakeFormBuilderApi = {
  // Upload template file (Excel, Word, PDF)
  uploadTemplate: async (file: File): Promise<{ fields: FormField[]; fileType: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Determine file type
    const fileType = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      ? 'excel'
      : file.name.endsWith('.docx') || file.name.endsWith('.doc')
      ? 'word'
      : file.name.endsWith('.pdf')
      ? 'pdf'
      : 'unknown';

    // OFFLINE MODE: Skip upload if no backend URL
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    if (!apiBase || apiBase.trim() === '') {
      throw new Error('File upload not available in offline mode');
    }
    const response = await fetch(`${apiBase}${BASE_PATH}/intake-forms/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Generate form from template
  generateForm: async (templateId: string, formName: string): Promise<IntakeForm> => {
    return apiCall<IntakeForm>(`${BASE_PATH}/intake-forms/generate`, {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId, name: formName }),
    });
  },

  // List all intake forms
  listForms: async (): Promise<IntakeForm[]> => {
    try {
      return await apiCall<IntakeForm[]>(`${BASE_PATH}/intake-forms`);
    } catch (err: any) {
      // OFFLINE MODE: Any error -> return empty array
      console.log('Intake forms API unavailable (offline mode), using defaults');
      return [];
    }
  },

  // Get form details
  getForm: async (id: string): Promise<IntakeForm> => {
    return apiCall<IntakeForm>(`${BASE_PATH}/intake-forms/${id}`);
  },

  // Update form
  updateForm: async (id: string, data: Partial<IntakeForm>): Promise<IntakeForm> => {
    return apiCall<IntakeForm>(`${BASE_PATH}/intake-forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete form
  deleteForm: async (id: string): Promise<void> => {
    return apiCall<void>(`${BASE_PATH}/intake-forms/${id}`, {
      method: 'DELETE',
    });
  },
};

// Intake Submission APIs
export const intakeSubmissionApi = {
  // Submit intake form
  submit: async (formId: string, data: Record<string, any>): Promise<IntakeSubmission> => {
    try {
      // Ensure the path always includes /api prefix
      const endpoint = `${BASE_PATH}/intake-forms/${formId}/submit`;
      // Double-check that endpoint has /api prefix
      const finalEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      
      console.log('Submitting form to:', finalEndpoint);
      
      return await apiCall<IntakeSubmission>(finalEndpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Save to localStorage
      console.log('Intake submission API unavailable (offline mode), saving to localStorage');
      const stored = JSON.parse(localStorage.getItem('localIntakeSubmissions') || '[]');
      const newSubmission = {
        id: `submission-${Date.now()}`,
        form_id: formId,
        citizen_id: data.email || `citizen-${Date.now()}`,
        consent_given: data.consent_given || false,
        urgency_level: data.urgency_level || 'Standard',
        status: 'Pending',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        ...data,
      };
      stored.push(newSubmission);
      localStorage.setItem('localIntakeSubmissions', JSON.stringify(stored));
      return newSubmission as IntakeSubmission;
    }
  },

  // List all submissions
  listSubmissions: async (): Promise<IntakeSubmission[]> => {
    try {
      return await apiCall<IntakeSubmission[]>(`${BASE_PATH}/submissions`);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage
      console.log('Submissions API unavailable (offline mode), using localStorage');
      try {
        const stored = JSON.parse(localStorage.getItem('localIntakeSubmissions') || '[]');
        return stored;
      } catch (localErr) {
        return [];
      }
    }
  },

  // Get submission details
  getSubmission: async (id: string): Promise<IntakeSubmission & { data: SubmissionData[] }> => {
    return apiCall<IntakeSubmission & { data: SubmissionData[] }>(`${BASE_PATH}/submissions/${id}`);
  },

  // Update submission status
  updateStatus: async (id: string, status: string): Promise<IntakeSubmission> => {
    return apiCall<IntakeSubmission>(`${BASE_PATH}/submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete submission
  delete: async (id: string): Promise<void> => {
    try {
      return await apiCall<void>(`${BASE_PATH}/submissions/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      // OFFLINE MODE: Delete from localStorage
      console.log('Submissions API unavailable (offline mode), deleting from localStorage');
      const stored = JSON.parse(localStorage.getItem('localIntakeSubmissions') || '[]');
      const filtered = stored.filter((s: any) => s.id !== id);
      localStorage.setItem('localIntakeSubmissions', JSON.stringify(filtered));
    }
  },
};

// Program APIs (Customer Side)
export const programApi = {
  // List programs
  list: async (): Promise<Program[]> => {
    return apiCall<Program[]>(`${BASE_PATH}/programs`);
  },

  // Create program
  create: async (data: { name: string; description?: string }): Promise<Program> => {
    return apiCall<Program>(`${BASE_PATH}/programs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Apply to program
  apply: async (programId: string, submissionId: string): Promise<ProgramApplication> => {
    return apiCall<ProgramApplication>(`${BASE_PATH}/programs/${programId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ submission_id: submissionId }),
    });
  },
};

// Analytics APIs
export const analyticsApi = {
  // Get overview statistics
  getOverview: async (): Promise<AnalyticsOverview> => {
    try {
      return await apiCall<AnalyticsOverview>(`${BASE_PATH}/analytics/overview`);
    } catch (err: any) {
      // OFFLINE MODE: Any error -> return default empty stats
      console.log('Analytics API unavailable (offline mode), using defaults');
      return {
        total_intakes: 0,
        active_programs: 0,
        pending_applications: 0,
        completed_cases: 0,
        total_referrals: 0,
        referral_success_rate: 0,
      };
    }
  },

  // Get program statistics
  getProgramStats: async (): Promise<ProgramStatistics[]> => {
    try {
      return await apiCall<ProgramStatistics[]>(`${BASE_PATH}/analytics/programs`);
    } catch (err: any) {
      // OFFLINE MODE: Any error -> return empty array
      console.log('Analytics API unavailable (offline mode), using defaults');
      return [];
    }
  },

  // Get demographics breakdown
  getDemographics: async (): Promise<DemographicsBreakdown> => {
    try {
      return await apiCall<DemographicsBreakdown>(`${BASE_PATH}/analytics/demographics`);
    } catch (err: any) {
      // OFFLINE MODE: Any error -> return empty demographics
      console.log('Analytics API unavailable (offline mode), using defaults');
      return {
        age_ranges: {},
        household_sizes: {},
        income_ranges: {},
        service_types: {},
      };
    }
  },

  // Get intake trends over time
  getTrends: async (): Promise<Array<{ date: string; count: number }>> => {
    try {
      return await apiCall<Array<{ date: string; count: number }>>(`${BASE_PATH}/analytics/trends`);
    } catch (err: any) {
      // OFFLINE MODE: Any error -> return empty array
      console.log('Analytics API unavailable (offline mode), using defaults');
      return [];
    }
  },
};

// Beam Integration API
export const beamIntegrationApi = {
  // Sync citizen data to Beam (only user information)
  syncCitizen: async (citizenId: string): Promise<void> => {
    return apiCall<void>('/api/beam/sync-citizen', {
      method: 'POST',
      body: JSON.stringify({ citizen_id: citizenId }),
    });
  },
};

// Static Pages API
export const staticPagesApi = {
  list: async (): Promise<Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
  }>> => {
    try {
      const pages = await apiCall<Array<{
        _id?: string;
        id?: string;
        title: string;
        slug: string;
        content: string;
        isPublished: boolean;
        createdAt: string;
        updatedAt: string;
      }>>(`${BASE_PATH}/static-pages`);
      return pages.map(page => ({
        id: page._id || page.id || '',
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: page.isPublished,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      }));
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage
      console.log('Static pages API unavailable (offline mode), using localStorage');
      try {
        const stored = JSON.parse(localStorage.getItem('localStaticPages') || '[]');
        return stored;
      } catch (localErr) {
        return [];
      }
    }
  },

  get: async (id: string): Promise<{
    id: string;
    title: string;
    slug: string;
    content: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
  }> => {
    try {
      const page = await apiCall<{
        _id?: string;
        id?: string;
        title: string;
        slug: string;
        content: string;
        isPublished: boolean;
        createdAt: string;
        updatedAt: string;
      }>(`${BASE_PATH}/static-pages/${id}`);
      return {
        id: page._id || page.id || id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: page.isPublished,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      };
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage
      console.log('Static page API unavailable (offline mode), using localStorage');
      const stored = JSON.parse(localStorage.getItem('localStaticPages') || '[]');
      const found = stored.find((p: any) => p.id === id);
      if (found) return found;
      throw new Error('Static page not found');
    }
  },

  create: async (data: {
    title: string;
    slug: string;
    content: string;
    isPublished?: boolean;
  }): Promise<void> => {
    try {
      return await apiCall<void>(`${BASE_PATH}/static-pages`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Save to localStorage
      console.log('Static pages API unavailable (offline mode), saving to localStorage');
      const stored = JSON.parse(localStorage.getItem('localStaticPages') || '[]');
      const newPage = {
        id: `static-page-${Date.now()}`,
        ...data,
        isPublished: data.isPublished || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      stored.push(newPage);
      localStorage.setItem('localStaticPages', JSON.stringify(stored));
    }
  },

  update: async (id: string, data: {
    title?: string;
    slug?: string;
    content?: string;
    isPublished?: boolean;
  }): Promise<void> => {
    try {
      return await apiCall<void>(`${BASE_PATH}/static-pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // OFFLINE MODE: Update in localStorage
      console.log('Static pages API unavailable (offline mode), updating in localStorage');
      const stored = JSON.parse(localStorage.getItem('localStaticPages') || '[]');
      const index = stored.findIndex((p: any) => p.id === id);
      if (index >= 0) {
        stored[index] = { ...stored[index], ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem('localStaticPages', JSON.stringify(stored));
      }
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      return await apiCall<void>(`${BASE_PATH}/static-pages/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      // OFFLINE MODE: Delete from localStorage
      console.log('Static pages API unavailable (offline mode), deleting from localStorage');
      const stored = JSON.parse(localStorage.getItem('localStaticPages') || '[]');
      const filtered = stored.filter((p: any) => p.id !== id);
      localStorage.setItem('localStaticPages', JSON.stringify(filtered));
    }
  },
};
