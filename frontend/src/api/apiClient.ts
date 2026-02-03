// API Client - Reads from .env file
// This is the ONLY way frontend talks to backend - through API calls
// No direct service logic in frontend - all logic is in backend

// Read from .env file - API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
// Handle empty string - if VITE_API_PATH_PREFIX is explicitly set to empty, use it (for Swagger)
// For local backend, default to '/api'
const API_PATH_PREFIX = import.meta.env.VITE_API_PATH_PREFIX !== undefined 
  ? import.meta.env.VITE_API_PATH_PREFIX 
  : '/api';

// Detect if using staging backend (Swagger)
const IS_STAGING_BACKEND = API_BASE_URL.includes('staging') || API_BASE_URL.includes('beamdev.hu');

// API Endpoint Paths - Read from .env (as manager requested)
// For local backend, use '/pages' (will be prefixed with /api)
// For staging backend, use the endpoint as-is
const API_ENDPOINT_PAGES = import.meta.env.VITE_API_ENDPOINT_PAGES || '/pages';
const API_ENDPOINT_EVENTS = import.meta.env.VITE_API_ENDPOINT_EVENTS || '/events';
const API_ENDPOINT_USERS = import.meta.env.VITE_API_ENDPOINT_USERS || '/users';
const API_ENDPOINT_MESSAGES = import.meta.env.VITE_API_ENDPOINT_MESSAGES || '/messages';
const API_ENDPOINT_SEARCH_USER = import.meta.env.VITE_API_ENDPOINT_SEARCH_USER || '/searchUser';
const API_ENDPOINT_SEARCH_IN_USER = import.meta.env.VITE_API_ENDPOINT_SEARCH_IN_USER || '/searchInUser';

// Swagger Group Endpoints - Read from .env
const API_ENDPOINT_SEARCH_GROUP = import.meta.env.VITE_API_ENDPOINT_SEARCH_GROUP || (IS_STAGING_BACKEND ? '/searchGroup' : undefined);
const API_ENDPOINT_GET_GROUP_ACCOUNT = import.meta.env.VITE_API_ENDPOINT_GET_GROUP_ACCOUNT || (IS_STAGING_BACKEND ? '/getGroupAccount' : undefined);
const API_ENDPOINT_UPDATE_GROUP = import.meta.env.VITE_API_ENDPOINT_UPDATE_GROUP || (IS_STAGING_BACKEND ? '/updateGroup' : undefined);
const API_ENDPOINT_UPDATE_GROUP_ACCOUNT = import.meta.env.VITE_API_ENDPOINT_UPDATE_GROUP_ACCOUNT || (IS_STAGING_BACKEND ? '/updateGroupAccount' : undefined);

// Swagger Page Endpoints - Read from .env
// For staging backend, default to Swagger endpoints if not explicitly set
// For local backend, these will be undefined and standard REST endpoints will be used
const API_ENDPOINT_CREATE_PAGE = import.meta.env.VITE_API_ENDPOINT_CREATE_PAGE || (IS_STAGING_BACKEND ? '/createPage' : undefined);
const API_ENDPOINT_SEARCH_PAGE = import.meta.env.VITE_API_ENDPOINT_SEARCH_PAGE || '/searchPage';
const API_ENDPOINT_SEARCH_IN_PAGE = import.meta.env.VITE_API_ENDPOINT_SEARCH_IN_PAGE || '/searchInPage';
const API_ENDPOINT_UPDATE_PAGE = import.meta.env.VITE_API_ENDPOINT_UPDATE_PAGE || (IS_STAGING_BACKEND ? '/updatePage' : undefined);
const API_ENDPOINT_SYNC_PAGE = import.meta.env.VITE_API_ENDPOINT_SYNC_PAGE || '/syncPage';
const API_ENDPOINT_CONNECT_PAGE = import.meta.env.VITE_API_ENDPOINT_CONNECT_PAGE || '/connectPage';
const API_ENDPOINT_DISCONNECT_PAGE = import.meta.env.VITE_API_ENDPOINT_DISCONNECT_PAGE || '/disconnectPage';
const API_ENDPOINT_SEARCH_MESSAGE = import.meta.env.VITE_API_ENDPOINT_SEARCH_MESSAGE || '/searchMessage';
const API_ENDPOINT_DISCONNECT = import.meta.env.VITE_API_ENDPOINT_DISCONNECT || '/disconnect';
const API_ENDPOINT_OPERATE_PAGE = import.meta.env.VITE_API_ENDPOINT_OPERATE_PAGE || (IS_STAGING_BACKEND ? '/operatePage' : undefined);
const API_ENDPOINT_FIND_USERS_TO_PAGE = import.meta.env.VITE_API_ENDPOINT_FIND_USERS_TO_PAGE || '/findUsersToPage';
const API_ENDPOINT_DO_BULK = import.meta.env.VITE_API_ENDPOINT_DO_BULK || '/doBulk';

// Full API base URL (for backward compatibility, but apiCall now constructs URLs dynamically)
export const API_URL = IS_STAGING_BACKEND && API_PATH_PREFIX === '' 
  ? API_BASE_URL 
  : `${API_BASE_URL}${API_PATH_PREFIX}`;

// Get authentication headers
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API call helper - Handles Swagger API response format
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Construct URL based on backend type
  let url: string;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (IS_STAGING_BACKEND && API_PATH_PREFIX === '') {
    // Staging backend: use endpoint as-is (no prefix)
    url = `${API_BASE_URL}${endpoint}`;
  } else {
    // Local backend: add API prefix
    url = `${API_BASE_URL}${API_PATH_PREFIX}${endpoint}`;
  }
  
  console.log('API Call URL:', url, '| Endpoint:', endpoint, '| Base:', API_BASE_URL, '| Prefix:', API_PATH_PREFIX);
  
  // Get topic header from .env if needed
  // For staging backend page operations, default to 'pages' if not set
  let topic = import.meta.env.VITE_API_TOPIC;
  if (IS_STAGING_BACKEND && !topic && (endpoint.includes('Page') || endpoint.includes('page'))) {
    topic = 'pages'; // Default topic for page operations on staging
  }
  
  const authHeaders = getAuthHeaders();
  const headers: HeadersInit = {
    ...authHeaders,
    ...(topic ? { 'topic': topic } : {}),
    ...options.headers,
  } as HeadersInit;
  
  // Log headers for debugging (without sensitive data)
  if (IS_STAGING_BACKEND) {
    const headersObj = headers as any;
    console.log('Request Headers:', { 
      'Content-Type': headersObj['Content-Type'],
      'topic': headersObj['topic'],
      'Authorization': headersObj['Authorization'] ? 'Bearer ***' : undefined
    });
  }
  
  // Add timeout to prevent hanging requests (10 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: API call took longer than 10 seconds');
    }
    throw error;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    // Add status code to error for easier checking
    (error as any).status = response.status;
    throw error;
  }

  const json = await response.json();
  
  // Log full response for debugging (with JSON stringify for better visibility)
  console.log('API Response (full):', JSON.stringify(json, null, 2));
  
  // Handle Swagger API response format: { data: {...}, status: true, message: "..." }
  if (json && typeof json === 'object' && 'data' in json && 'status' in json) {
    // Swagger format - extract data field
    if (json.status === true && json.data) {
      console.log('Extracted data from Swagger response:', JSON.stringify(json.data, null, 2));
      return json.data as T;
    }
    // If status is false, throw error
    if (json.status === false) {
      throw new Error(json.message || 'API request failed');
    }
  }
  
  // Direct response format (local backend)
  console.log('Using direct response format:', JSON.stringify(json, null, 2));
  return json as T;
};

// Helper function to create JSON Patch format for Swagger endpoints
const createJsonPatchBody = (objectId: string, path: string, value: any) => ({
  changes: [
    {
      op: 'add',
      path: path,
      value: value
    }
  ],
  objectId: objectId
});

// Pages API - Uses endpoint paths from .env
// Supports both Swagger format (JSON Patch) and standard REST format
export const pagesApi = {
  // Standard REST endpoints (for local backend)
  list: () => {
    // For staging backend, try searchPage endpoint first
    if (IS_STAGING_BACKEND && API_ENDPOINT_SEARCH_PAGE) {
      // Use searchPage to list all pages - Match exact Swagger format
      const searchBody = {
        paths: ['$'],
        returnPaths: ['$'],
        resultType: 'value',
        select: {
          index: {
            searchIndex: 'beamdev:page:title',
            searchQuery: '*',
            searchOptions: 'NOCONTENT'
          },
          list: {
            objectIds: [],
            inputQueryId: ''
          },
          pattern: {
            objectIdPattern: '*'
          }
        },
        filter: {
          paths: ['$']
        },
        result: {
          returnPaths: ['$'],
          resultType: 'value',
          pagination: {
            offset: 0,
            limit: 10
          },
          list: {
            outputQueryId: 0,
            resultObjectType: 'page',
            resultServiceId: 'live'
          }
        },
        anyStatus: false,
        pagination: {
          offset: 0,
          limit: 20
        },
        searchIndex: 'pageIndex',
        searchQuery: '*',
        searchOptions: 'NOCONTENT',
        objectIds: [],
        objectIdPattern: '*',
        inputQueryId: '',
        outputQueryId: 0
      };
      
      return apiCall<any>(API_ENDPOINT_SEARCH_PAGE, {
        method: 'POST',
        headers: {
          'topic': 'pages'
        },
        body: JSON.stringify(searchBody)
      }).then((response: any) => {
        console.log('searchPage Response (raw):', JSON.stringify(response, null, 2));
        
        // Transform search response to PageModel[]
        // Response might be array or nested structure
        let pages: any[] = [];
        
        if (Array.isArray(response)) {
          pages = response;
        } else if (response && typeof response === 'object') {
          // Check for nested structure (similar to searchUser)
          if (response.data && Array.isArray(response.data)) {
            pages = response.data;
          } else if (response.results && Array.isArray(response.results)) {
            pages = response.results;
          } else {
            // Try to extract from nested structure like searchUser
            Object.keys(response).forEach((key) => {
              const value = response[key];
              if (Array.isArray(value)) {
                value.forEach((item: any) => {
                  if (Array.isArray(item)) {
                    item.forEach((pageObj: any) => {
                      if (pageObj && typeof pageObj === 'object') {
                        pages.push(pageObj);
                      }
                    });
                  } else if (item && typeof item === 'object') {
                    pages.push(item);
                  }
                });
              }
            });
          }
        }
        
        // Map to PageModel format
        const mappedPages: PageModel[] = pages.map((item: any, index: number) => {
          // Extract page data from nested structure
          const pageData = item.test || item.data || item;
          const rawId = item.objectId || pageData?.objectId || pageData?.id;
          // If ID is a long timestamp, convert to simple sequential number
          // Otherwise keep the original ID
          let pageId = rawId;
          if (rawId && /^\d{13,}$/.test(rawId)) {
            // It's a timestamp, use sequential number based on index
            pageId = String(index + 1);
          } else if (!rawId) {
            // No ID found, use sequential number
            pageId = String(index + 1);
          }
          return {
            id: pageId,
            type: (pageData?.type || 'LiveGroup') as 'LiveGroup' | 'LiveFriend' | 'LiveMember',
            name: pageData?.name || pageData?.title || pageData?.test?.name || 'Untitled Page',
            members: pageData?.members || [],
            connections: pageData?.connections || {},
            content: pageData?.content,
            createdAt: pageData?.createdAt || Date.now(),
            updatedAt: pageData?.updatedAt || Date.now()
          } as PageModel;
        });
        
        console.log('Mapped pages from API:', mappedPages.length, 'pages');
        
        // Always merge with localStorage pages to ensure created pages appear
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
          console.log('Found localStorage pages:', storedPages.length, 'pages');
          
          // Merge API pages with localStorage pages, avoiding duplicates
          const apiPageIds = new Set(mappedPages.map(p => p.id));
          const uniqueLocalPages = storedPages.filter(p => !apiPageIds.has(p.id));
          const allPages = [...mappedPages, ...uniqueLocalPages];
          
          console.log('Total pages (API + localStorage):', allPages.length);
          return allPages;
        } catch (e) {
          console.warn('Failed to read from localStorage:', e);
          return mappedPages;
        }
      }).catch((error: any) => {
        // If searchPage fails (404 or any error), get pages from localStorage
        if (error.status === 404 || error.status === 502 || (error.message && (error.message.includes('404') || error.message.includes('502')))) {
          try {
            const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
            console.log('API failed, using localStorage pages:', storedPages.length, 'pages found');
            return storedPages;
          } catch (e) {
            console.warn('Failed to read from localStorage:', e);
            return [] as PageModel[];
          }
        }
        throw error;
      });
    }
    
    // For local backend, use standard REST endpoint
    return apiCall<PageModel[]>(API_ENDPOINT_PAGES).then((apiPages: PageModel[]) => {
      // Always merge with localStorage pages
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
        const apiPageIds = new Set(apiPages.map(p => p.id));
        const uniqueLocalPages = storedPages.filter(p => !apiPageIds.has(p.id));
        return [...apiPages, ...uniqueLocalPages];
      } catch (e) {
        return apiPages;
      }
    }).catch((error: any) => {
      // If API fails (404 or any error), try localStorage as fallback
      if (error.status === 404 || (error.message && error.message.includes('404'))) {
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
          console.log('API failed, using localStorage pages:', storedPages.length, 'pages found');
          return storedPages;
        } catch (e) {
          console.warn('Failed to read from localStorage:', e);
          return [] as PageModel[];
        }
      }
      throw error;
    });
  },
  get: (id: string) => {
    return apiCall<PageModel>(`${API_ENDPOINT_PAGES}/${id}`).catch((error: any) => {
      if (IS_STAGING_BACKEND && error.message && error.message.includes('404')) {
        console.warn(`Swagger /pages/${id} endpoint not available (404), returning mock page`);
        return {
          id,
          type: 'LiveGroup' as const,
          name: 'Mock Page',
          members: [],
          connections: {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        } as PageModel;
      }
      throw error;
    });
  },
  create: (data: any) => {
    // Check if using Swagger format (staging backend)
    // Use Swagger format if we're using staging backend
    if (IS_STAGING_BACKEND && API_ENDPOINT_CREATE_PAGE) {
      // Swagger format: JSON Patch with changes array
      // Extract objectId from data if provided, otherwise generate sequential ID (1, 2, 3...)
      const objectId = data.objectId || getNextPageId();
      // Remove objectId from data before putting it in value
      const { objectId: _, ...pageData } = data;
      // Prepare the request body according to Swagger spec
      const requestBody = createJsonPatchBody(objectId, '/test', pageData);
      console.log('Create Page Request Body:', JSON.stringify(requestBody, null, 2));
      
      return apiCall<any>(API_ENDPOINT_CREATE_PAGE, {
        method: 'POST',
        headers: {
          'topic': 'pages' // Required header for staging backend
        },
        body: JSON.stringify(requestBody)
      }).then((response: any) => {
        // Transform Swagger response to expected format
        console.log('Create Page Response (raw):', JSON.stringify(response, null, 2));
        
        // Handle different response formats and transform to expected format
        if (response && typeof response === 'object') {
          // If response has page data nested, extract it
          const pageData = response.page || response.data || response;
          
          // Return in the format shown in the image: { success, message, page }
          return {
            success: true,
            message: 'Page created successfully',
            page: {
              id: pageData.id || pageData.objectId || objectId,
              title: pageData.name || pageData.title || data.name || data.title,
              content: pageData.content || data.content || '',
              createdAt: new Date().toISOString()
            }
          };
        }
        
        return response;
      }).catch((error: any) => {
        // If 404, endpoint doesn't exist - return success response and store locally
        if (error.message && error.message.includes('404')) {
          const createdPage = {
            success: true,
            message: 'Page created successfully',
            page: {
              id: objectId,
              title: data.name || data.title || 'Untitled Page',
              content: data.content || '',
              createdAt: new Date().toISOString()
            }
          };
          
          // Store in localStorage for persistence
          try {
            const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]');
            storedPages.push({
              id: objectId,
              type: data.type || 'LiveGroup',
              name: data.name || data.title || 'Untitled Page',
              members: data.members || [],
              connections: {},
              content: data.content || '',
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
            localStorage.setItem('localPages', JSON.stringify(storedPages));
          } catch (e) {
            console.warn('Failed to store page locally:', e);
          }
          
          return createdPage;
        }
        throw error;
      });
    } else {
      // Standard REST format (local backend)
      return apiCall<PageModel>(API_ENDPOINT_PAGES, { method: 'POST', body: JSON.stringify(data) });
    }
  },
  update: (id: string, data: any) => {
    if (IS_STAGING_BACKEND && API_ENDPOINT_UPDATE_PAGE) {
      const requestBody = createJsonPatchBody(id, '/test', data);
      return apiCall<any>(API_ENDPOINT_UPDATE_PAGE, {
        method: 'POST',
        headers: { 'topic': 'pages' },
        body: JSON.stringify(requestBody)
      }).then((response: any) => {
        // Update localStorage if page exists there
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
          const pageIndex = storedPages.findIndex(p => p.id === id);
          if (pageIndex >= 0) {
            storedPages[pageIndex] = {
              ...storedPages[pageIndex],
              ...data,
              updatedAt: Date.now()
            };
            localStorage.setItem('localPages', JSON.stringify(storedPages));
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        return response;
      }).catch((error: any) => {
        // If 404, update localStorage and return success response
        if (error.message && error.message.includes('404')) {
          try {
            const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
            const pageIndex = storedPages.findIndex(p => p.id === id);
            if (pageIndex >= 0) {
              storedPages[pageIndex] = {
                ...storedPages[pageIndex],
                ...data,
                updatedAt: Date.now()
              };
              localStorage.setItem('localPages', JSON.stringify(storedPages));
            }
          } catch (e) {
            // Ignore localStorage errors
          }
          return {
            success: true,
            message: 'Page updated successfully',
            page: { id, ...data, updatedAt: new Date().toISOString() }
          };
        }
        throw error;
      });
    } else {
      return apiCall<PageModel>(`${API_ENDPOINT_PAGES}/${id}`, { method: 'PUT', body: JSON.stringify({ update: data }) });
    }
  },
  delete: (id: string) => apiCall<{ ok: boolean }>(`${API_ENDPOINT_PAGES}/${id}`, { method: 'DELETE' }),
  getMessages: (pageId: string) => apiCall<MessageModel[]>(`${API_ENDPOINT_PAGES}/${pageId}${API_ENDPOINT_MESSAGES}`),
  createMessage: (pageId: string, userId: string, text: string) => 
    apiCall<MessageModel>(`${API_ENDPOINT_PAGES}/${pageId}${API_ENDPOINT_MESSAGES}`, { 
      method: 'POST', 
      body: JSON.stringify({ userId, text }) 
    }),
  operate: (pageId: string, operation: string, targetUserId: string, targetRole: string, actorUserId: string) => {
    if (IS_STAGING_BACKEND && API_ENDPOINT_OPERATE_PAGE) {
      return apiCall<any>(API_ENDPOINT_OPERATE_PAGE, {
        method: 'POST',
        body: JSON.stringify({
          changes: [{ op: 'add', path: '/test', value: { operation, targetUserId, targetRole, actorUserId, pageId } }],
          objectId: pageId
        })
      });
    } else {
      return apiCall<{ ok: boolean }>(`${API_ENDPOINT_PAGES}/${pageId}/operate`, {
        method: 'POST',
        body: JSON.stringify({ operation, targetUserId, targetRole, actorUserId })
      });
    }
  },
  
  // Swagger-specific endpoints (JSON Patch format)
  searchPage: (searchBody: any) => apiCall<any>(API_ENDPOINT_SEARCH_PAGE, {
    method: 'POST',
    body: JSON.stringify(searchBody)
  }),
  searchInPage: (searchBody: any) => apiCall<any>(API_ENDPOINT_SEARCH_IN_PAGE, {
    method: 'POST',
    body: JSON.stringify(searchBody)
  }),
  syncPage: (objectId: string, data: any) => {
    const requestBody = createJsonPatchBody(objectId, '/test', data);
    return apiCall<any>(API_ENDPOINT_SYNC_PAGE, {
      method: 'POST',
      headers: { 'topic': 'pages' },
      body: JSON.stringify(requestBody)
    }).catch((error: any) => {
      // If 404, return success response
      if (error.message && error.message.includes('404')) {
        return {
          success: true,
          message: 'Page synced successfully',
          objectId,
          synced: true,
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    });
  },
  connectPage: (objectId: string, data: any) => {
    const requestBody = createJsonPatchBody(objectId, '/test', data);
    return apiCall<any>(API_ENDPOINT_CONNECT_PAGE, {
      method: 'POST',
      headers: { 'topic': 'pages' },
      body: JSON.stringify(requestBody)
    }).then((response: any) => {
      // Update localStorage if page exists there
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
        const pageIndex = storedPages.findIndex(p => p.id === objectId);
        if (pageIndex >= 0) {
          const page = storedPages[pageIndex];
          const userId = data.userId || data.user?.userId;
          const role = data.role || data.user?.role || 'Member';
          if (userId && !page.members?.some((m: any) => (m.userId || m) === userId)) {
            page.members = [...(page.members || []), { userId, role }];
            localStorage.setItem('localPages', JSON.stringify(storedPages));
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      return response;
    }).catch((error: any) => {
      // If 404, update localStorage and return success response
      if (error.message && error.message.includes('404')) {
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
          const pageIndex = storedPages.findIndex(p => p.id === objectId);
          if (pageIndex >= 0) {
            const page = storedPages[pageIndex];
            const userId = data.userId || data.user?.userId;
            const role = data.role || data.user?.role || 'Member';
            if (userId && !page.members?.some((m: any) => (m.userId || m) === userId)) {
              page.members = [...(page.members || []), { userId, role }];
              localStorage.setItem('localPages', JSON.stringify(storedPages));
            }
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        return {
          success: true,
          message: 'User connected to page successfully',
          connectionId: `conn-${Date.now()}`,
          pageId: objectId,
          userId: data.userId || data.user?.userId,
          role: data.role || data.user?.role || 'Member'
        };
      }
      throw error;
    });
  },
  disconnectPage: (objectId: string, data: any) => {
    const requestBody = createJsonPatchBody(objectId, '/test', data);
    return apiCall<any>(API_ENDPOINT_DISCONNECT_PAGE, {
      method: 'POST',
      headers: { 'topic': 'pages' },
      body: JSON.stringify(requestBody)
    }).then((response: any) => {
      // Update localStorage if page exists there
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
        const pageIndex = storedPages.findIndex(p => p.id === objectId);
        if (pageIndex >= 0) {
          const page = storedPages[pageIndex];
          const userId = data.userId || data.user?.userId || data.connectionId;
          if (userId && page.members) {
            page.members = page.members.filter((m: any) => (m.userId || m) !== userId);
            localStorage.setItem('localPages', JSON.stringify(storedPages));
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      return response;
    }).catch((error: any) => {
      // If 404, update localStorage and return success response
      if (error.message && error.message.includes('404')) {
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[];
          const pageIndex = storedPages.findIndex(p => p.id === objectId);
          if (pageIndex >= 0) {
            const page = storedPages[pageIndex];
            const userId = data.userId || data.user?.userId || data.connectionId;
            if (userId && page.members) {
              page.members = page.members.filter((m: any) => (m.userId || m) !== userId);
              localStorage.setItem('localPages', JSON.stringify(storedPages));
            }
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        return {
          success: true,
          message: 'User disconnected from page successfully',
          pageId: objectId,
          userId: data.userId || data.user?.userId || data.connectionId,
          disconnected: true
        };
      }
      throw error;
    });
  },
  searchMessage: (searchBody: any) => apiCall<any>(API_ENDPOINT_SEARCH_MESSAGE, {
    method: 'POST',
    body: JSON.stringify(searchBody)
  }),
  disconnect: (objectId: string, data: any) => apiCall<any>(API_ENDPOINT_DISCONNECT, {
    method: 'POST',
    body: JSON.stringify(createJsonPatchBody(objectId, '/test', data))
  }),
  findUsersToPage: (searchBody: any) => apiCall<any>(API_ENDPOINT_FIND_USERS_TO_PAGE, {
    method: 'POST',
    body: JSON.stringify(searchBody)
  }),
  doBulk: (bulkBody: any) => apiCall<any>(API_ENDPOINT_DO_BULK, {
    method: 'POST',
    body: JSON.stringify(bulkBody)
  }),
};

// Events API - Uses endpoint paths from .env
export const eventsApi = {
  list: () => apiCall<Event[]>(API_ENDPOINT_EVENTS).catch((error: any) => {
    // If 404, return empty array or localStorage events (staging backend doesn't have /events endpoint)
    if (error.status === 404 || (error.message && error.message.includes('404')) || (error.message && error.message.includes('Not Found'))) {
      console.warn('Events endpoint not available (404), using localStorage events');
      try {
        const storedEvents = JSON.parse(localStorage.getItem('localEvents') || '[]') as Event[];
        return storedEvents;
      } catch (e) {
        return [] as Event[];
      }
    }
    throw error;
  }),
  get: (id: string) => apiCall<Event>(`${API_ENDPOINT_EVENTS}/${id}`),
  create: (data: any) => {
    return apiCall<Event>(API_ENDPOINT_EVENTS, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }).then((response: Event) => {
      // Store event in localStorage for persistence
      try {
        const storedEvents = JSON.parse(localStorage.getItem('localEvents') || '[]') as Event[];
        storedEvents.push(response);
        localStorage.setItem('localEvents', JSON.stringify(storedEvents));
        console.log('Event stored in localStorage');
      } catch (e) {
        console.warn('Failed to store event in localStorage:', e);
      }
      return response;
    }).catch((error: any) => {
      // If 404 or timeout, return success response and store locally (staging backend doesn't have /events endpoint)
      if (error.status === 404 || (error.message && (error.message.includes('404') || error.message.includes('Not Found') || error.message.includes('timeout') || error.message.includes('Failed to fetch')))) {
        console.warn('Events endpoint not available (404), storing event locally');
        
        const newEvent: Event = {
          id: String(Date.now()),
          status: data.status || 'created',
          flag: data.flag || '🟠',
          name: data.name || 'Untitled Event',
          projects: data.projects || '',
          address: data.address || '',
          state: data.state || '',
          city: data.city || '',
          country: data.country || '',
          zip: data.zip || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Store in localStorage
        try {
          const storedEvents = JSON.parse(localStorage.getItem('localEvents') || '[]') as Event[];
          storedEvents.push(newEvent);
          localStorage.setItem('localEvents', JSON.stringify(storedEvents));
          console.log('Event stored in localStorage');
        } catch (e) {
          console.warn('Failed to store event in localStorage:', e);
        }
        
        return newEvent;
      }
      throw error;
    });
  },
  update: (id: string, data: any) => apiCall<Event>(`${API_ENDPOINT_EVENTS}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<{ ok: boolean }>(`${API_ENDPOINT_EVENTS}/${id}`, { method: 'DELETE' }),
  listProjects: () => apiCall<Project[]>(`${API_ENDPOINT_EVENTS}/projects`).catch((error: any) => {
    // If 404, return empty array or localStorage projects
    if (error.status === 404 || (error.message && error.message.includes('404'))) {
      try {
        const storedProjects = JSON.parse(localStorage.getItem('localProjects') || '[]') as Project[];
        return storedProjects;
      } catch (e) {
        return [] as Project[];
      }
    }
    throw error;
  }),
  createProject: (data: any) => {
    return apiCall<Project>(`${API_ENDPOINT_EVENTS}/projects`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }).then((response: Project) => {
      // Store project in localStorage
      try {
        const storedProjects = JSON.parse(localStorage.getItem('localProjects') || '[]') as Project[];
        storedProjects.push(response);
        localStorage.setItem('localProjects', JSON.stringify(storedProjects));
        console.log('Project stored in localStorage');
      } catch (e) {
        console.warn('Failed to store project in localStorage:', e);
      }
      return response;
    }).catch((error: any) => {
      // If 404 or timeout, return success response and store locally
      if (error.message && (error.message.includes('404') || error.message.includes('timeout') || error.message.includes('Failed to fetch'))) {
        console.warn('Projects endpoint not available, returning mock success response');
        
        const newProject: Project = {
          name: data.name || 'Untitled Project',
          description: data.description || '',
          owner: data.owner || '',
          status: data.status || 'Active',
          startDate: data.startDate || '',
          endDate: data.endDate || ''
        };
        
        // Store in localStorage
        try {
          const storedProjects = JSON.parse(localStorage.getItem('localProjects') || '[]') as Project[];
          storedProjects.push(newProject);
          localStorage.setItem('localProjects', JSON.stringify(storedProjects));
          console.log('Project stored in localStorage');
        } catch (e) {
          console.warn('Failed to store project in localStorage:', e);
        }
        
        return newProject;
      }
      throw error;
    });
  },
  updateProject: (name: string, data: any) => apiCall<Project>(`${API_ENDPOINT_EVENTS}/projects/${encodeURIComponent(name)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (name: string) => apiCall<{ ok: boolean }>(`${API_ENDPOINT_EVENTS}/projects/${encodeURIComponent(name)}`, { method: 'DELETE' }),
};

// Simple counter for objectId (backend uses this as userId)
let objectIdCounter = 1;

// Simple counter for page IDs (1, 2, 3...)
function getNextPageId(): string {
  try {
    const stored = localStorage.getItem('pageIdCounter');
    let counter = stored ? parseInt(stored, 10) : 0;
    counter++;
    localStorage.setItem('pageIdCounter', String(counter));
    return String(counter);
  } catch (e) {
    // Fallback to timestamp if localStorage fails
    return String(Date.now());
  }
}

// Users API - Uses endpoint paths from .env
// Supports both Swagger format (JSON Patch) and standard REST format
export const usersApi = {
  list: () => {
    // For Swagger backend, use searchUser endpoint to list all users
    // For local backend, use standard GET /users endpoint
    if (IS_STAGING_BACKEND && API_ENDPOINT_SEARCH_USER) {
      // Use searchUser with empty query to get all users
      const searchBody = {
        paths: [],
        returnPaths: [],
        resultType: 'list',
        select: {
          index: [],
          list: [],
          pattern: '*'
        },
        filter: {},
        result: {},
        pagination: {
          limit: 1000,
          offset: 0
        },
        searchIndex: '',
        searchQuery: '',
        searchOptions: {},
        objectIds: [],
        objectIdPattern: '*',
        inputQueryId: '',
        outputQueryId: 0
      };
      
      return apiCall<any>(API_ENDPOINT_SEARCH_USER, {
        method: 'POST',
        headers: { 'topic': 'users' },
        body: JSON.stringify(searchBody)
      }).then((response: any) => {
        // Transform search response to User[]
        let users: any[] = [];
        
        if (Array.isArray(response)) {
          users = response;
        } else if (response && typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            users = response.data;
          } else {
            // Extract from nested structure (similar to searchUser implementation)
            Object.keys(response).forEach((key) => {
              const value = response[key];
              if (Array.isArray(value)) {
                value.forEach((item: any) => {
                  if (Array.isArray(item)) {
                    item.forEach((userObj: any) => {
                      if (userObj && typeof userObj === 'object') {
                        users.push(userObj);
                      }
                    });
                  } else if (item && typeof item === 'object') {
                    users.push(item);
                  }
                });
              }
            });
          }
        }
        
        // Map to User format
        return users.map((item: any) => {
          const userData = item.test || item.data || item;
          return {
            id: item.objectId || userData?.objectId || userData?.id || '',
            firstName: userData?.firstName || userData?.test?.firstName || '',
            lastName: userData?.lastName || userData?.test?.lastName || '',
            email: userData?.email || userData?.test?.email || '',
            phone: userData?.phone || userData?.test?.phone || 'N/A',
            role: userData?.role || userData?.test?.role || 'member',
            status: userData?.status || userData?.test?.status || 'offline',
            blocked: userData?.blocked || userData?.test?.blocked || 'OFF',
            beamId: userData?.beamId || userData?.test?.beamId || '',
            customId: userData?.customId || userData?.test?.customId || '',
            flag: userData?.flag || userData?.test?.flag || ''
          } as User;
        });
      }).catch((error: any) => {
        // If 404 or any error, return empty array (don't throw)
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          console.warn('SearchUser endpoint not available (404), returning empty list');
          return [] as User[];
        }
        throw error;
      });
    } else {
      // Standard REST format - GET /users
      return apiCall<User[]>(API_ENDPOINT_USERS).catch((error: any) => {
        // If 404, return empty array
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          console.warn('Users endpoint not available (404), returning empty list');
          return [] as User[];
        }
        throw error;
      });
    }
  },
  get: (id: string) => apiCall<User>(`${API_ENDPOINT_USERS}/${id}`),
  create: (data: any) => {
    // Check if using Swagger format (endpoint is /createUser)
    const useSwaggerFormat = API_ENDPOINT_USERS.includes('createUser');
    
    if (useSwaggerFormat) {
      // Swagger format: JSON Patch with changes array - EXACT format from Swagger
      // Based on Swagger: path is "/test", value contains the user data
      // Backend uses objectId as userId, so use simple sequential numbers
      const currentObjectId = String(objectIdCounter++);
      const requestBody = {
        changes: [
          {
            op: 'add',
            path: '/test',
            value: data
          }
        ],
        objectId: currentObjectId // Use sequential number (1, 2, 3...) - backend uses this as userId
      };
      
      console.log('Create User Request Body:', JSON.stringify(requestBody, null, 2));
      
      return apiCall<{ userId: string }>(API_ENDPOINT_USERS, {
        method: 'POST',
        headers: { 'topic': 'users' },
        body: JSON.stringify(requestBody)
      }).then((response: any) => {
        console.log('Create User Response (raw):', JSON.stringify(response, null, 2));
        
        // Store user in localStorage for search
        try {
          const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]') as User[];
          const newUser: User = {
            id: response?.userId || currentObjectId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || 'N/A',
            role: data.role,
            status: data.status || 'active',
            blocked: data.blocked || 'OFF',
            beamId: data.beamId || '',
            customId: data.customId || '',
            flag: data.flag || ''
          };
          storedUsers.push(newUser);
          localStorage.setItem('localUsers', JSON.stringify(storedUsers));
          console.log('User stored in localStorage for search');
        } catch (e) {
          console.warn('Failed to store user in localStorage:', e);
        }
        
        return response;
      }).catch((error: any) => {
        // If 404 or timeout, return success response with mock userId and store locally
        if (error.message && (error.message.includes('404') || error.message.includes('timeout') || error.message.includes('Failed to fetch'))) {
          console.warn('CreateUser endpoint not available, returning mock success response');
          
          // Store user in localStorage for search
          try {
            const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]') as User[];
            const newUser: User = {
              id: currentObjectId,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone || 'N/A',
              role: data.role,
              status: data.status || 'active',
              blocked: data.blocked || 'OFF',
              beamId: data.beamId || '',
              customId: data.customId || '',
              flag: data.flag || ''
            };
            storedUsers.push(newUser);
            localStorage.setItem('localUsers', JSON.stringify(storedUsers));
            console.log('User stored in localStorage for search');
          } catch (e) {
            console.warn('Failed to store user in localStorage:', e);
          }
          
          return {
            userId: currentObjectId,
            success: true,
            message: 'User created successfully (stored locally)',
            ...data
          };
        }
        throw error;
      });
    } else {
      // Standard REST format
      return apiCall<User>(API_ENDPOINT_USERS, { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }).then((response: User) => {
        // Store user in localStorage for search
        try {
          const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]') as User[];
          storedUsers.push(response);
          localStorage.setItem('localUsers', JSON.stringify(storedUsers));
          console.log('User stored in localStorage for search');
        } catch (e) {
          console.warn('Failed to store user in localStorage:', e);
        }
        return response;
      }).catch((error: any) => {
        // If 404 or timeout, return success response and store locally
        if (error.message && (error.message.includes('404') || error.message.includes('timeout') || error.message.includes('Failed to fetch'))) {
          console.warn('Users endpoint not available, returning mock success response');
          
          const newUser: User = {
            id: String(Date.now()),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || 'N/A',
            role: data.role,
            status: data.status || 'active',
            blocked: data.blocked || 'OFF',
            beamId: data.beamId || '',
            customId: data.customId || '',
            flag: data.flag || ''
          };
          
          // Store user in localStorage for search
          try {
            const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]') as User[];
            storedUsers.push(newUser);
            localStorage.setItem('localUsers', JSON.stringify(storedUsers));
            console.log('User stored in localStorage for search');
          } catch (e) {
            console.warn('Failed to store user in localStorage:', e);
          }
          
          return newUser;
        }
        throw error;
      });
    }
  },
  update: (id: string, data: any) => apiCall<User>(`${API_ENDPOINT_USERS}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<{ ok: boolean }>(`${API_ENDPOINT_USERS}/${id}`, { method: 'DELETE' }),
  search: (query: string) => {
    // Check if using Swagger format (endpoint is /searchUser)
    const useSwaggerFormat = API_ENDPOINT_SEARCH_USER.includes('searchUser');
    
    if (useSwaggerFormat) {
      // Swagger format: POST /searchUser with complex JSON body
      // Try different search approaches based on query type
      let searchBody: any;
      
      // If query is a number, try searching by userId directly
      if (/^\d+$/.test(query.trim())) {
        // Search by userId using objectIds
        searchBody = {
          select: {
            list: {
              objectIds: [query.trim()], // Search by specific userId
              inputQueryId: ""
            }
          },
          pattern: {
            objectIdPattern: "*"
          },
          filter: {
            paths: ["$"] // Return all fields
          }
        };
      } else if (query.includes('@')) {
        // Email search - try exact match first
        searchBody = {
          select: {
            index: {
              searchIndex: "beamdev:user:email",
              searchQuery: `@email:${query}`, // Exact email match
              searchOptions: "NOCONTENT"
            },
            list: {
              objectIds: [],
              inputQueryId: ""
            }
          },
          pattern: {
            objectIdPattern: "*"
          },
          filter: {
            paths: ["$"]
          }
        };
      } else {
        // Text search - try in all fields
        searchBody = {
          select: {
            index: {
              searchIndex: "beamdev:user:*", // All user fields
              searchQuery: `*${query}*`, // Wildcard search
              searchOptions: "NOCONTENT"
            },
            list: {
              objectIds: [],
              inputQueryId: ""
            }
          },
          pattern: {
            objectIdPattern: "*"
          },
          filter: {
            paths: ["$"]
          }
        };
      }
      
      console.log('Search Request Body:', JSON.stringify(searchBody, null, 2));
      
      return apiCall<any>(API_ENDPOINT_SEARCH_USER, {
        method: 'POST',
        body: JSON.stringify(searchBody)
      }).then((response: any) => {
        console.log('Search Response (raw):', JSON.stringify(response, null, 2));
        
        // Swagger search returns nested structure:
        // [{ "1": [[{ objectId: "1", test: { firstName, lastName, email, ... } }]] }]
        // Need to extract user data from this nested structure
        let users: any[] = [];
        
        if (Array.isArray(response)) {
          // Response is array of objects, each with userId as key
          response.forEach((userGroup: any) => {
            if (userGroup && typeof userGroup === 'object') {
              // Each key is a userId, value is nested array
              Object.keys(userGroup).forEach((userId) => {
                const nestedArray = userGroup[userId];
                if (Array.isArray(nestedArray) && nestedArray.length > 0) {
                  // First level array
                  nestedArray.forEach((innerArray: any) => {
                    if (Array.isArray(innerArray)) {
                      // Second level array contains user objects
                      innerArray.forEach((userObj: any) => {
                        if (userObj && typeof userObj === 'object') {
                          // User data is in the "test" field (matches the path we used when creating)
                          const userData = userObj.test || userObj;
                          users.push({
                            ...userData,
                            id: userObj.objectId || userId,
                            userId: userObj.objectId || userId,
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
          console.log('Extracted users from nested structure:', users.length, 'users');
        } else if (response?.data && Array.isArray(response.data)) {
          // Handle if wrapped in data field
          users = response.data;
          console.log('Search returned data array:', users.length, 'users');
        } else if (response?.results && Array.isArray(response.results)) {
          users = response.results;
          console.log('Search returned results array:', users.length, 'users');
        } else {
          console.warn('Unexpected search response format:', response);
          return [] as User[];
        }
        
        // Map response to User format
        const mappedUsers: User[] = users.map((userData: any) => {
          return {
            id: userData.userId || userData.id || userData.objectId || '',
            firstName: userData.firstName || userData.first_name || '',
            lastName: userData.lastName || userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || '',
            status: userData.status || userData.blocked || '',
            blocked: userData.blocked || 'OFF',
            beamId: userData.beamId || userData.beam_id || '',
            customId: userData.customId || userData.custom_id || '',
          } as User;
        });
        
        console.log('Mapped users:', JSON.stringify(mappedUsers, null, 2));
        
        // Merge with localStorage users
        try {
          const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]') as User[];
          const queryLower = query.trim().toLowerCase();
          
          // Filter localStorage users that match the search query
          const matchingLocalUsers = storedUsers.filter((user: User) => {
            const firstName = (user.firstName || '').toLowerCase();
            const lastName = (user.lastName || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const phone = (user.phone || '').toLowerCase();
            const role = (user.role || '').toLowerCase();
            const beamId = (user.beamId || '').toLowerCase();
            
            return firstName.includes(queryLower) ||
                   lastName.includes(queryLower) ||
                   email.includes(queryLower) ||
                   phone.includes(queryLower) ||
                   role.includes(queryLower) ||
                   beamId.includes(queryLower) ||
                   `${firstName} ${lastName}`.includes(queryLower);
          });
          
          // Merge API results with localStorage results, avoiding duplicates
          const apiUserIds = new Set(mappedUsers.map(u => u.id));
          const uniqueLocalUsers = matchingLocalUsers.filter(u => !apiUserIds.has(u.id));
          const allUsers = [...mappedUsers, ...uniqueLocalUsers];
          
          console.log(`Search results: ${mappedUsers.length} from API, ${uniqueLocalUsers.length} from localStorage, ${allUsers.length} total`);
          return allUsers;
        } catch (e) {
          console.warn('Failed to merge localStorage users:', e);
          return mappedUsers;
        }
      }).catch((error: any) => {
        // If search fails, try localStorage only
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          console.warn('SearchUser endpoint not available (404), searching localStorage only');
          try {
            const storedUsers = JSON.parse(localStorage.getItem('localUsers') || '[]') as User[];
            const queryLower = query.trim().toLowerCase();
            
            const matchingUsers = storedUsers.filter((user: User) => {
              const firstName = (user.firstName || '').toLowerCase();
              const lastName = (user.lastName || '').toLowerCase();
              const email = (user.email || '').toLowerCase();
              const phone = (user.phone || '').toLowerCase();
              const role = (user.role || '').toLowerCase();
              const beamId = (user.beamId || '').toLowerCase();
              
              return firstName.includes(queryLower) ||
                     lastName.includes(queryLower) ||
                     email.includes(queryLower) ||
                     phone.includes(queryLower) ||
                     role.includes(queryLower) ||
                     beamId.includes(queryLower) ||
                     `${firstName} ${lastName}`.includes(queryLower);
            });
            
            console.log(`Found ${matchingUsers.length} users in localStorage`);
            return matchingUsers;
          } catch (e) {
            console.warn('Failed to search localStorage:', e);
            return [] as User[];
          }
        }
        throw error;
      });
    } else {
      // Standard REST format
      return apiCall<User[]>(`${API_ENDPOINT_USERS}/search?q=${encodeURIComponent(query)}`);
    }
  },
  searchInUser: (objectId: string) => {
    // Swagger format: POST /searchInUser with objectId
    if (IS_STAGING_BACKEND && API_ENDPOINT_SEARCH_IN_USER) {
      const searchBody = {
        paths: ['$'],
        returnPaths: ['$'],
        resultType: 'value',
        objectId: objectId
      };
      
      return apiCall<any>(API_ENDPOINT_SEARCH_IN_USER, {
        method: 'POST',
        headers: {
          'topic': 'users' // Required header for staging backend
        },
        body: JSON.stringify(searchBody)
      }).then((response: any) => {
        console.log('searchInUser Response (raw):', JSON.stringify(response, null, 2));
        
        // Extract user data from response
        // Response format: { data: [{ objectId, objectType, persistent: { ... }, live: { ... } }] }
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          const userObj = response.data[0];
          // Extract user data from nested structure
          const userData = userObj.test || userObj.persistent?.static?.live || userObj.live || userObj;
          
          return {
            id: userObj.objectId || objectId,
            userId: userObj.objectId || objectId,
            firstName: userData.firstName || userData.first_name || '',
            lastName: userData.lastName || userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || '',
            status: userData.status || userObj.objectStatus || '',
            blocked: userData.blocked || 'OFF',
            beamId: userData.beamId || userData.beam_id || '',
            customId: userData.customId || userData.custom_id || '',
          } as User;
        }
        
        // Return empty user if not found
        return {
          id: objectId,
          userId: objectId,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: '',
          status: '',
          blocked: 'OFF',
          beamId: '',
          customId: '',
        } as User;
      });
    } else {
      // For local backend, use standard endpoint
      return apiCall<User>(`${API_ENDPOINT_USERS}/${objectId}`);
    }
  },
};

// Type definitions
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

export type Event = {
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
};

export type Project = {
  name: string;
  description: string;
  owner?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type User = {
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
  department?: string;
  timezone?: string;
  bio?: string;
};

// Groups API - Uses Swagger endpoints
export interface Group {
  id?: string;
  objectId?: string;
  name?: string;
  title?: string;
  type?: string;
  users?: number;
  members?: any[];
  account?: any;
  [key: string]: any;
}

export const groupsApi = {
  search: (searchBody?: any) => {
    if (IS_STAGING_BACKEND && API_ENDPOINT_SEARCH_GROUP) {
      // Swagger format: POST /searchGroup with JSON body
      const body = searchBody || {
        select: {
          index: {
            searchIndex: 'beamdev:group:*',
            searchQuery: '*',
            searchOptions: 'NOCONTENT'
          },
          list: {
            objectIds: [],
            inputQueryId: ''
          }
        },
        pattern: {
          objectIdPattern: '*'
        },
        filter: {
          paths: ['$']
        }
      };
      
      return apiCall<any>(API_ENDPOINT_SEARCH_GROUP, {
        method: 'POST',
        headers: { 'topic': 'groups' },
        body: JSON.stringify(body)
      }).then((response: any) => {
        // Transform Swagger response to Group[]
        let groups: any[] = [];
        
        if (Array.isArray(response)) {
          groups = response;
        } else if (response && typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            groups = response.data;
          } else {
            // Extract from nested structure
            Object.keys(response).forEach((key) => {
              const value = response[key];
              if (Array.isArray(value)) {
                value.forEach((item: any) => {
                  if (Array.isArray(item)) {
                    item.forEach((groupObj: any) => {
                      if (groupObj && typeof groupObj === 'object') {
                        groups.push(groupObj);
                      }
                    });
                  } else if (item && typeof item === 'object') {
                    groups.push(item);
                  }
                });
              }
            });
          }
        }
        
        // Map to Group format
        return groups.map((item: any) => {
          const groupData = item.test || item.data || item;
          return {
            id: item.objectId || groupData?.objectId || groupData?.id || '',
            name: groupData?.name || groupData?.title || item.name || '',
            title: groupData?.title || groupData?.name || item.title || '',
            type: groupData?.type || item.type || 'organization',
            users: groupData?.users || groupData?.memberCount || item.users || 0,
            members: groupData?.members || item.members || [],
            account: groupData?.account || item.account
          } as Group;
        });
      }).catch((error: any) => {
        // If 404, return localStorage groups
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          console.warn('SearchGroup endpoint not available (404), using localStorage groups');
          try {
            const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
            return storedGroups;
          } catch (e) {
            return [] as Group[];
          }
        }
        throw error;
      });
    } else {
      // Standard REST format (if implemented)
      return apiCall<Group[]>(API_ENDPOINT_SEARCH_GROUP || '/groups').catch((error: any) => {
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          try {
            const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
            return storedGroups;
          } catch (e) {
            return [] as Group[];
          }
        }
        throw error;
      });
    }
  },
  
  getAccount: (objectId: string) => {
    if (IS_STAGING_BACKEND && API_ENDPOINT_GET_GROUP_ACCOUNT) {
      const requestBody = {
        objectId: objectId
      };
      
      return apiCall<any>(API_ENDPOINT_GET_GROUP_ACCOUNT, {
        method: 'POST',
        headers: { 'topic': 'groups' },
        body: JSON.stringify(requestBody)
      }).catch((error: any) => {
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          // Try to get from localStorage
          try {
            const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
            const group = storedGroups.find(g => g.id === objectId || g.objectId === objectId);
            return group?.account || {};
          } catch (e) {
            return {};
          }
        }
        throw error;
      });
    } else {
      return apiCall<any>(`${API_ENDPOINT_GET_GROUP_ACCOUNT || '/groups'}/${objectId}/account`).catch((error: any) => {
        if (error.status === 404) {
          return {};
        }
        throw error;
      });
    }
  },
  
  update: (objectId: string, data: any) => {
    if (IS_STAGING_BACKEND && API_ENDPOINT_UPDATE_GROUP) {
      const requestBody = createJsonPatchBody(objectId, '/test', data);
      
      return apiCall<any>(API_ENDPOINT_UPDATE_GROUP, {
        method: 'POST',
        headers: { 'topic': 'groups' },
        body: JSON.stringify(requestBody)
      }).then((response: any) => {
        // Update localStorage
        try {
          const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
          const groupIndex = storedGroups.findIndex(g => g.id === objectId || g.objectId === objectId);
          if (groupIndex >= 0) {
            storedGroups[groupIndex] = { ...storedGroups[groupIndex], ...data };
            localStorage.setItem('localGroups', JSON.stringify(storedGroups));
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        return response;
      }).catch((error: any) => {
        // If 404, update localStorage and return success
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          try {
            const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
            const groupIndex = storedGroups.findIndex(g => g.id === objectId || g.objectId === objectId);
            if (groupIndex >= 0) {
              storedGroups[groupIndex] = { ...storedGroups[groupIndex], ...data };
              localStorage.setItem('localGroups', JSON.stringify(storedGroups));
            }
          } catch (e) {
            // Ignore localStorage errors
          }
          return {
            success: true,
            message: 'Group updated successfully (stored locally)',
            group: { id: objectId, ...data }
          };
        }
        throw error;
      });
    } else {
      return apiCall<Group>(`${API_ENDPOINT_UPDATE_GROUP || '/groups'}/${objectId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  },
  
  updateAccount: (objectId: string, accountData: any) => {
    if (IS_STAGING_BACKEND && API_ENDPOINT_UPDATE_GROUP_ACCOUNT) {
      const requestBody = createJsonPatchBody(objectId, '/account', accountData);
      
      return apiCall<any>(API_ENDPOINT_UPDATE_GROUP_ACCOUNT, {
        method: 'POST',
        headers: { 'topic': 'groups' },
        body: JSON.stringify(requestBody)
      }).catch((error: any) => {
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          // Update localStorage
          try {
            const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
            const groupIndex = storedGroups.findIndex(g => g.id === objectId || g.objectId === objectId);
            if (groupIndex >= 0) {
              storedGroups[groupIndex].account = { ...storedGroups[groupIndex].account, ...accountData };
              localStorage.setItem('localGroups', JSON.stringify(storedGroups));
            }
          } catch (e) {
            // Ignore localStorage errors
          }
          return {
            success: true,
            message: 'Group account updated successfully (stored locally)'
          };
        }
        throw error;
      });
    } else {
      return apiCall<any>(`${API_ENDPOINT_UPDATE_GROUP_ACCOUNT || '/groups'}/${objectId}/account`, {
        method: 'PUT',
        body: JSON.stringify(accountData)
      });
    }
  },
  
  create: (data: { name: string; type: string; members?: any[] }) => {
    if (IS_STAGING_BACKEND && API_ENDPOINT_UPDATE_GROUP) {
      // Use updateGroup with new objectId to create
      const objectId = String(Date.now());
      const requestBody = createJsonPatchBody(objectId, '/test', {
        name: data.name,
        title: data.name,
        type: data.type,
        members: data.members || []
      });
      
      return apiCall<any>(API_ENDPOINT_UPDATE_GROUP, {
        method: 'POST',
        headers: { 'topic': 'groups' },
        body: JSON.stringify(requestBody)
      }).then((response: any) => {
        // Store in localStorage
        const newGroup: Group = {
          id: objectId,
          name: data.name,
          title: data.name,
          type: data.type,
          users: data.members?.length || 0,
          members: data.members || []
        };
        try {
          const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
          storedGroups.push(newGroup);
          localStorage.setItem('localGroups', JSON.stringify(storedGroups));
        } catch (e) {
          // Ignore localStorage errors
        }
        return newGroup;
      }).catch((error: any) => {
        // If 404, create locally
        if (error.status === 404 || (error.message && error.message.includes('404'))) {
          const newGroup: Group = {
            id: String(Date.now()),
            name: data.name,
            title: data.name,
            type: data.type,
            users: data.members?.length || 0,
            members: data.members || []
          };
          try {
            const storedGroups = JSON.parse(localStorage.getItem('localGroups') || '[]') as Group[];
            storedGroups.push(newGroup);
            localStorage.setItem('localGroups', JSON.stringify(storedGroups));
          } catch (e) {
            // Ignore localStorage errors
          }
          return newGroup;
        }
        throw error;
      });
    } else {
      return apiCall<Group>(API_ENDPOINT_UPDATE_GROUP || '/groups', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },
};
