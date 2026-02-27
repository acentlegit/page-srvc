// Roles API - Manages user roles and permissions

export interface Role {
  id: string
  name: string
  permissions: string[]
  bio?: string
  signupForm?: string
  createdAt: string
  updatedAt?: string
}

const ROLES_STORAGE_KEY = 'localRoles'

export const rolesApi = {
  // Get all roles
  getAll: async (): Promise<Role[]> => {
    try {
      // Try API first (if endpoint exists)
      // For now, use localStorage
      const roles = JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) || '[]') as Role[]
      return roles
    } catch (err) {
      console.error('Failed to get roles:', err)
      return []
    }
  },

  // Get role by ID
  getById: async (roleId: string): Promise<Role | null> => {
    try {
      const roles = JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) || '[]') as Role[]
      return roles.find(r => r.id === roleId) || null
    } catch (err) {
      console.error('Failed to get role:', err)
      return null
    }
  },

  // Create role
  create: async (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> => {
    try {
      const roles = JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) || '[]') as Role[]
      const newRole: Role = {
        ...role,
        id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      }
      roles.push(newRole)
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles))
      return newRole
    } catch (err) {
      console.error('Failed to create role:', err)
      throw err
    }
  },

  // Update role
  update: async (roleId: string, updates: Partial<Role>): Promise<Role> => {
    try {
      const roles = JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) || '[]') as Role[]
      const index = roles.findIndex(r => r.id === roleId)
      if (index === -1) {
        throw new Error('Role not found')
      }
      roles[index] = {
        ...roles[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles))
      return roles[index]
    } catch (err) {
      console.error('Failed to update role:', err)
      throw err
    }
  },

  // Delete role
  delete: async (roleId: string): Promise<void> => {
    try {
      const roles = JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) || '[]') as Role[]
      const filtered = roles.filter(r => r.id !== roleId)
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(filtered))
    } catch (err) {
      console.error('Failed to delete role:', err)
      throw err
    }
  },

  // Add permission to role
  addPermission: async (roleId: string, permission: string): Promise<Role> => {
    const role = await rolesApi.getById(roleId)
    if (!role) {
      throw new Error('Role not found')
    }
    if (!role.permissions.includes(permission)) {
      return rolesApi.update(roleId, {
        permissions: [...role.permissions, permission],
      })
    }
    return role
  },

  // Remove permission from role
  removePermission: async (roleId: string, permission: string): Promise<Role> => {
    const role = await rolesApi.getById(roleId)
    if (!role) {
      throw new Error('Role not found')
    }
    return rolesApi.update(roleId, {
      permissions: role.permissions.filter(p => p !== permission),
    })
  },
}

// Available permissions
export const AVAILABLE_PERMISSIONS = [
  'admin',
  'cad',
  'live',
  'onMove',
  'analytics',
  'manage_users',
  'manage_pages',
  'view_reports',
  'edit_content',
  'delete_content',
]
