// Customers API - Manages customer information
import { usersApi, User } from './apiClient'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  blocked: 'ON' | 'OFF'
  createdBy: string
  createdAt: string
  building?: string
  template?: string
  notes?: string
}

const CUSTOMERS_STORAGE_KEY = 'localCustomers'

export const customersApi = {
  // Get all customers
  getAll: async (): Promise<Customer[]> => {
    try {
      // Try to get customers from users with role='customer'
      const users = await usersApi.list()
      const customerUsers = users.filter((u: User) => 
        u.role?.toLowerCase() === 'customer' || 
        u.role?.toLowerCase() === 'customers'
      )
      
      // Map users to customers
      const customersFromUsers: Customer[] = customerUsers.map((user: User) => ({
        id: user.id || user.email || `CUST-${Date.now()}`,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
        email: user.email || '',
        phone: user.phone || 'N/A',
        blocked: (user.blocked === 'ON' ? 'ON' : 'OFF') as 'ON' | 'OFF',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
      }))
      
      // Also get from localStorage
      const storedCustomers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]') as Customer[]
      
      // Merge and deduplicate
      const allCustomersMap = new Map<string, Customer>()
      
      // Add from users first
      customersFromUsers.forEach(c => {
        if (c.id) allCustomersMap.set(c.id, c)
      })
      
      // Add from localStorage (they override users if same ID)
      storedCustomers.forEach(c => {
        if (c.id) allCustomersMap.set(c.id, c)
      })
      
      return Array.from(allCustomersMap.values())
    } catch (err) {
      console.error('Failed to get customers:', err)
      // Fallback to localStorage
      const storedCustomers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]') as Customer[]
      return storedCustomers
    }
  },

  // Get customer by ID
  getById: async (customerId: string): Promise<Customer | null> => {
    try {
      const customers = await customersApi.getAll()
      return customers.find(c => c.id === customerId) || null
    } catch (err) {
      console.error('Failed to get customer:', err)
      return null
    }
  },

  // Create customer
  create: async (customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>): Promise<Customer> => {
    try {
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]') as Customer[]
      const newCustomer: Customer = {
        ...customer,
        id: `CUST-${Date.now()}`,
        createdBy: 'admin', // Get from auth context
        createdAt: new Date().toISOString(),
      }
      customers.push(newCustomer)
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers))
      return newCustomer
    } catch (err) {
      console.error('Failed to create customer:', err)
      throw err
    }
  },

  // Update customer
  update: async (customerId: string, updates: Partial<Customer>): Promise<Customer> => {
    try {
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]') as Customer[]
      const index = customers.findIndex(c => c.id === customerId)
      if (index === -1) {
        throw new Error('Customer not found')
      }
      customers[index] = {
        ...customers[index],
        ...updates,
      }
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers))
      return customers[index]
    } catch (err) {
      console.error('Failed to update customer:', err)
      throw err
    }
  },

  // Delete customer
  delete: async (customerId: string): Promise<void> => {
    try {
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]') as Customer[]
      const filtered = customers.filter(c => c.id !== customerId)
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(filtered))
    } catch (err) {
      console.error('Failed to delete customer:', err)
      throw err
    }
  },

  // Search customers
  search: async (query: string): Promise<Customer[]> => {
    const customers = await customersApi.getAll()
    const queryLower = query.toLowerCase()
    return customers.filter(c =>
      c.name.toLowerCase().includes(queryLower) ||
      c.email.toLowerCase().includes(queryLower) ||
      c.phone.toLowerCase().includes(queryLower) ||
      c.id.toLowerCase().includes(queryLower)
    )
  },
}
