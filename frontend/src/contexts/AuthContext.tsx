import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../api/auth'
import { usersApi } from '../api/apiClient'

export type UserRole = 'customer' | 'staff' | 'admin'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: UserRole
  customerId?: string
  purpose?: string
  status: 'active' | 'inactive' | 'pending'
  boarded: boolean
  [key: string]: any
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: CustomerSignupData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: Partial<AuthUser>) => void
  hasRole: (role: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}

export interface CustomerSignupData {
  firstName: string
  lastName: string
  email: string
  phone: string
  customerId?: string
  purpose?: string
  password: string
  role?: UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser')
        const token = localStorage.getItem('authToken')
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser)
          // Use stored user directly (API verification not needed for staging backend)
          // The staging backend doesn't have a GET user endpoint, so we use localStorage
          const normalizedRole = normalizeRole(parsedUser.role)
          setUser({
            ...parsedUser,
            role: normalizedRole,
          })
          
          // Optionally try to verify with API (but don't fail if it doesn't exist)
          // Skip API verification if ID is an email address (not a valid user ID)
          const isEmail = parsedUser.id && parsedUser.id.includes('@')
          if (!isEmail) {
            try {
              const userInfo = await usersApi.get(parsedUser.id)
              if (userInfo) {
                const normalizedRole = normalizeRole(userInfo.role || parsedUser.role)
                setUser({
                  ...parsedUser,
                  ...userInfo,
                  role: normalizedRole,
                })
              }
            } catch (err: any) {
              // API verification failed (expected for staging backend), use stored user
              // Only log if it's a real error (not 404)
              if (err.status && err.status !== 404) {
                console.warn('User verification failed:', err)
              }
              // Keep using stored user from localStorage
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user:', err)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // OFFLINE MODE: Skip all API calls and work entirely with localStorage
      console.log('🔐 Offline login mode - using localStorage only')
      
      const emailLower = email.toLowerCase().trim()
      let foundUser: any = null
      
      // Check localStorage for locally stored users
      try {
        // Check localUsers array
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]')
        console.log('🔍 Checking localUsers:', localUsers.length, 'users found')
        foundUser = localUsers.find((u: any) => {
          const match = u.email?.toLowerCase() === emailLower
          if (match) console.log('✅ Found user in localUsers:', u)
          return match
        })
        
        // Also check if currentUser matches (in case user was just created)
        if (!foundUser) {
          const currentUserStr = localStorage.getItem('currentUser')
          if (currentUserStr) {
            try {
              const currentUser = JSON.parse(currentUserStr)
              if (currentUser.email?.toLowerCase() === emailLower) {
                foundUser = currentUser
                console.log('✅ Found user in currentUser localStorage')
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
        
        // Also check all localStorage keys that might contain user data
        if (!foundUser) {
          console.log('🔍 Searching all localStorage keys for user data...')
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.includes('user') || key.includes('User'))) {
              try {
                const value = localStorage.getItem(key)
                if (value) {
                  const parsed = JSON.parse(value)
                  // Check if it's a user object or array of users
                  if (Array.isArray(parsed)) {
                    const userInArray = parsed.find((u: any) => 
                      u.email?.toLowerCase() === emailLower
                    )
                    if (userInArray) {
                      foundUser = userInArray
                      console.log(`✅ Found user in localStorage key: ${key}`)
                      break
                    }
                  } else if (parsed.email?.toLowerCase() === emailLower) {
                    foundUser = parsed
                    console.log(`✅ Found user in localStorage key: ${key}`)
                    break
                  }
                }
              } catch (e) {
                // Ignore parse errors for this key
              }
            }
          }
        }
      } catch (localErr) {
        console.error('Error checking localStorage:', localErr)
      }
      
      if (foundUser) {
        // User found, set them as logged in
        const normalizedRole = normalizeRole(foundUser.role)
        const authUser: AuthUser = {
          id: foundUser.id || foundUser.userId || foundUser.objectId || email,
          email: foundUser.email || email,
          firstName: foundUser.firstName || '',
          lastName: foundUser.lastName || '',
          phone: foundUser.phone || '',
          role: normalizedRole,
          customerId: foundUser.customId,
          status: foundUser.blocked === 'OFF' ? 'active' : 'inactive',
          boarded: foundUser.flag === 'boarded' || false,
        }
        
        setUser(authUser)
        localStorage.setItem('currentUser', JSON.stringify(authUser))
        localStorage.setItem('authToken', 'local-token')
        
        // Also add to localUsers for cross-browser access
        try {
          const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]')
          const exists = localUsers.some((u: any) => u.email?.toLowerCase() === emailLower)
          if (!exists) {
            localUsers.push({
              id: authUser.id,
              email: authUser.email,
              firstName: authUser.firstName,
              lastName: authUser.lastName,
              phone: authUser.phone,
              role: authUser.role,
              status: authUser.status,
              blocked: 'OFF',
              beamId: '',
              customId: authUser.customerId,
              flag: ''
            })
            localStorage.setItem('localUsers', JSON.stringify(localUsers))
            console.log('✅ User added to localUsers for cross-browser access')
          }
        } catch (e) {
          console.warn('Failed to add user to localUsers:', e)
        }
        
        console.log('✅ User logged in successfully (offline mode):', authUser)
        return
      }
      
      // User not found - create a new user session automatically (offline mode)
      console.log('⚠️ User not found, creating new user session automatically (offline mode)')
      
      // Determine role based on email
      let userRole: UserRole = 'customer'
      if (emailLower.includes('admin') || emailLower.includes('poojitha')) {
        userRole = 'admin'
      } else if (emailLower.includes('staff') || emailLower.includes('employee')) {
        userRole = 'staff'
      }
      
      // Create a new user session
      const newUser: AuthUser = {
        id: email, // Use email as ID for offline mode
        email: email,
        firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        lastName: '',
        phone: '',
        role: userRole,
        customerId: userRole === 'customer' ? `customer-${Date.now()}` : undefined,
        status: 'active',
        boarded: false,
      }
      
      setUser(newUser)
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      localStorage.setItem('authToken', 'local-token')
      
      // Add to localUsers
      try {
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]')
        const exists = localUsers.some((u: any) => u.email?.toLowerCase() === emailLower)
        if (!exists) {
          localUsers.push({
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phone: newUser.phone,
            role: newUser.role,
            status: newUser.status,
            blocked: 'OFF',
            beamId: '',
            customId: newUser.customerId,
            flag: ''
          })
          localStorage.setItem('localUsers', JSON.stringify(localUsers))
          console.log('✅ New user created and added to localUsers')
        }
      } catch (e) {
        console.warn('Failed to add user to localUsers:', e)
      }
      
      console.log('✅ New user session created (offline mode):', newUser)
    } catch (err: any) {
      console.error('Login error:', err)
      throw new Error(err.message || 'Login failed')
    }
  }

  const signup = async (data: CustomerSignupData) => {
    try {
      // OFFLINE MODE: Create user entirely in localStorage
      console.log('🔐 Offline signup mode - using localStorage only')
      
      const selectedRole = data.role || 'customer'
      const emailLower = data.email.trim().toLowerCase()
      const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`
      
      // Create user object
      const authUser: AuthUser = {
        id: userId,
        email: emailLower,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim() || '',
        role: selectedRole,
        customerId: data.customerId?.trim() || (selectedRole === 'customer' ? `customer-${Date.now()}` : undefined),
        purpose: data.purpose,
        status: selectedRole === 'admin' ? 'active' : 'pending',
        boarded: false,
      }
      
      // Save to localStorage
      setUser(authUser)
      localStorage.setItem('currentUser', JSON.stringify(authUser))
      localStorage.setItem('authToken', 'local-token')
      
      // Add to localUsers array
      try {
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]')
        const exists = localUsers.some((u: any) => u.email?.toLowerCase() === emailLower)
        if (!exists) {
          localUsers.push({
            id: userId,
            email: emailLower,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: data.phone.trim() || '',
            role: selectedRole,
            status: selectedRole === 'admin' ? 'active' : 'pending',
            blocked: 'OFF',
            beamId: emailLower.split('@')[0],
            customId: authUser.customerId,
            flag: '',
            password: data.password, // Store password for offline mode (not secure, but works offline)
          })
          localStorage.setItem('localUsers', JSON.stringify(localUsers))
          console.log('✅ User created and added to localUsers (offline mode)')
        }
      } catch (e) {
        console.warn('Failed to add user to localUsers:', e)
      }
      
      console.log('✅ User signed up successfully (offline mode):', authUser)
    } catch (err: any) {
      console.error('Signup error:', err)
      throw new Error(err.message || 'Registration failed. Please try again.')
    }
  }

  const logout = async () => {
    try {
      // OFFLINE MODE: Skip API call
      console.log('🔐 Offline logout mode')
      // Try API call but don't fail if it doesn't work
      try {
        await authApi.logout()
      } catch (err) {
        // Ignore logout API errors in offline mode
        console.log('Logout API call failed (expected in offline mode)')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('currentUser')
      localStorage.removeItem('authToken')
    }
  }

  const updateUser = (updatedUser: Partial<AuthUser>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser }
      setUser(newUser)
      localStorage.setItem('currentUser', JSON.stringify(newUser))
    }
  }

  // Normalize role from backend format to our UserRole type
  const normalizeRole = (role: string | undefined): UserRole => {
    if (!role) return 'customer'
    const normalized = role.toLowerCase()
    // Map backend roles to our role system
    if (normalized === 'member' || normalized === 'customer') return 'customer'
    if (normalized === 'staff' || normalized === 'employee') return 'staff'
    if (normalized === 'admin' || normalized === 'administrator') return 'admin'
    return normalized as UserRole
  }

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    const userRole = normalizeRole(user.role)
    return roles.includes(userRole)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Admin has all permissions
    if (user.role === 'admin') return true
    
    // Define permissions based on role
    const permissions: Record<UserRole, string[]> = {
      admin: ['*'], // All permissions
      staff: [
        'view_assigned_pages',
        'chat_with_customers',
        'view_uploaded_media',
        'view_tasks',
        'update_task_status',
      ],
      customer: [
        'view_assigned_pages',
        'use_chat',
        'upload_media',
        'submit_forms',
        'convert_pages_to_chat',
      ],
    }
    
    const userPermissions = permissions[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
