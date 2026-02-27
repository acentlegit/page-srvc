import { apiClient } from './config'
import { activityTracking, getCurrentUserInfo, createActivityDescription } from './activityTracking'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface Opportunity {
  id: string
  name: string
  value: number
  stage: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
  accountId: string
  accountName?: string
  leadId?: string
  probability?: number
  expectedCloseDate?: string
  createdAt: string
  updatedAt?: string
}

export interface Account {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  createdAt: string
  updatedAt?: string
}

export const crmApi = {
  // Leads API
  createLead: async (lead: Partial<Lead>): Promise<Lead> => {
    try {
      const response = await apiClient.post('/createLead', lead)
      const apiLead = response.data
      
      // Always also save to localStorage for consistency
      if (apiLead && apiLead.id) {
        const leads = JSON.parse(localStorage.getItem('localLeads') || '[]') as Lead[]
        const existingIndex = leads.findIndex(l => l.id === apiLead.id)
        if (existingIndex >= 0) {
          leads[existingIndex] = apiLead
        } else {
          leads.push(apiLead)
        }
        localStorage.setItem('localLeads', JSON.stringify(leads))
        console.log('✅ Lead saved to localStorage:', apiLead)
      }
      
      return apiLead
    } catch (err: any) {
      // Fallback to localStorage
      console.warn('⚠️ API failed, creating lead in localStorage:', err)
      const leads = JSON.parse(localStorage.getItem('localLeads') || '[]') as Lead[]
      const newLead: Lead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        status: (lead.status as any) || 'NEW',
        notes: lead.notes || '',
        createdAt: new Date().toISOString(),
      }
      leads.push(newLead)
      localStorage.setItem('localLeads', JSON.stringify(leads))
      console.log('✅ Lead created in localStorage:', newLead)
      console.log('✅ Total leads in localStorage:', leads.length)
      
      // Log activity
      const userInfo = getCurrentUserInfo()
      const activity = activityTracking.log({
        type: 'lead',
        entityId: newLead.id,
        entityName: newLead.name,
        action: 'created',
        userId: userInfo.id,
        userName: userInfo.name,
        description: createActivityDescription('created', newLead.name),
      })
      console.log('✅ Activity logged:', activity)
      
      return newLead
    }
  },

  getAllLeads: async (): Promise<Lead[]> => {
    try {
      const response = await apiClient.post('/searchLead', {})
      const apiLeads = response.data || []
      console.log('📋 API returned leads:', apiLeads.length)
      
      // Always merge with localStorage to ensure we have all leads
      const localLeads = JSON.parse(localStorage.getItem('localLeads') || '[]') as Lead[]
      console.log('📋 localStorage leads:', localLeads.length)
      
      // Merge: combine API and localStorage, remove duplicates
      const allLeadsMap = new Map<string, Lead>()
      
      // Add API leads first
      apiLeads.forEach((lead: Lead) => {
        if (lead.id) allLeadsMap.set(lead.id, lead)
      })
      
      // Add localStorage leads (they override API if same ID)
      localLeads.forEach((lead: Lead) => {
        if (lead.id) allLeadsMap.set(lead.id, lead)
      })
      
      const mergedLeads = Array.from(allLeadsMap.values())
      console.log('📋 Merged leads:', mergedLeads.length)
      
      return mergedLeads
    } catch (err: any) {
      // Fallback to localStorage
      console.warn('📋 API failed, using localStorage only:', err)
      const leads = JSON.parse(localStorage.getItem('localLeads') || '[]') as Lead[]
      console.log('📋 Returning localStorage leads:', leads.length)
      return leads
    }
  },

  updateLead: async (leadId: string, update: Partial<Lead>): Promise<Lead> => {
    try {
      const response = await apiClient.post('/updateLead', { leadId, ...update })
      return response.data
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const leads = JSON.parse(localStorage.getItem('localLeads') || '[]') as Lead[]
        const index = leads.findIndex(l => l.id === leadId)
        if (index >= 0) {
          const oldLead = { ...leads[index] }
          leads[index] = { ...leads[index], ...update, updatedAt: new Date().toISOString() }
          localStorage.setItem('localLeads', JSON.stringify(leads))
          
          // Track changes
          const changes: Record<string, { old: any; new: any }> = {}
          Object.keys(update).forEach(key => {
            if (oldLead[key as keyof Lead] !== update[key as keyof Lead]) {
              changes[key] = {
                old: oldLead[key as keyof Lead],
                new: update[key as keyof Lead],
              }
            }
          })
          
          // Log activity
          const userInfo = getCurrentUserInfo()
          const action = update.status && update.status !== oldLead.status ? 'status_changed' : 'updated'
          activityTracking.log({
            type: 'lead',
            entityId: leadId,
            entityName: leads[index].name,
            action,
            userId: userInfo.id,
            userName: userInfo.name,
            description: createActivityDescription(action, leads[index].name, changes),
            changes: Object.keys(changes).length > 0 ? changes : undefined,
          })
          
          return leads[index]
        }
        throw new Error('Lead not found')
      }
      throw err
    }
  },

  deleteLead: async (leadId: string): Promise<void> => {
    try {
      await apiClient.post('/deleteLead', { leadId })
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const leads = JSON.parse(localStorage.getItem('localLeads') || '[]') as Lead[]
        const lead = leads.find(l => l.id === leadId)
        const filtered = leads.filter(l => l.id !== leadId)
        localStorage.setItem('localLeads', JSON.stringify(filtered))
        
        // Log activity
        if (lead) {
          const userInfo = getCurrentUserInfo()
          activityTracking.log({
            type: 'lead',
            entityId: leadId,
            entityName: lead.name,
            action: 'deleted',
            userId: userInfo.id,
            userName: userInfo.name,
            description: createActivityDescription('deleted', lead.name),
          })
        }
        
        return
      }
      throw err
    }
  },

  convertLead: async (leadId: string, value?: number): Promise<{ account: Account; opportunity: Opportunity }> => {
    try {
      const response = await apiClient.post('/convertLead', { leadId, value })
      return response.data
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const leads = JSON.parse(localStorage.getItem('localLeads') || '[]') as Lead[]
        const lead = leads.find(l => l.id === leadId)
        if (!lead) {
          throw new Error('Lead not found')
        }

        // Create account
        const accounts = JSON.parse(localStorage.getItem('localAccounts') || '[]') as Account[]
        const account: Account = {
          id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          createdAt: new Date().toISOString(),
        }
        accounts.push(account)
        localStorage.setItem('localAccounts', JSON.stringify(accounts))

        // Create opportunity
        const opportunities = JSON.parse(localStorage.getItem('localOpportunities') || '[]') as Opportunity[]
        const opportunity: Opportunity = {
          id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${lead.name} Opportunity`,
          value: value || 0,
          stage: 'PROSPECT',
          accountId: account.id,
          accountName: account.name,
          leadId: lead.id,
          createdAt: new Date().toISOString(),
        }
        opportunities.push(opportunity)
        localStorage.setItem('localOpportunities', JSON.stringify(opportunities))

        // Update lead status
        lead.status = 'CONVERTED'
        lead.updatedAt = new Date().toISOString()
        localStorage.setItem('localLeads', JSON.stringify(leads))

        // Log activity
        const userInfo = getCurrentUserInfo()
        activityTracking.log({
          type: 'lead',
          entityId: leadId,
          entityName: lead.name,
          action: 'converted',
          userId: userInfo.id,
          userName: userInfo.name,
          description: createActivityDescription('converted', lead.name),
        })
        
        activityTracking.log({
          type: 'account',
          entityId: account.id,
          entityName: account.name,
          action: 'created',
          userId: userInfo.id,
          userName: userInfo.name,
          description: createActivityDescription('created', account.name),
        })
        
        activityTracking.log({
          type: 'opportunity',
          entityId: opportunity.id,
          entityName: opportunity.name,
          action: 'created',
          userId: userInfo.id,
          userName: userInfo.name,
          description: createActivityDescription('created', opportunity.name),
        })

        return { account, opportunity }
      }
      throw err
    }
  },

  // Opportunities API
  getAllOpportunities: async (): Promise<Opportunity[]> => {
    try {
      const response = await apiClient.post('/searchOpportunity', {})
      return response.data || []
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const opportunities = JSON.parse(localStorage.getItem('localOpportunities') || '[]') as Opportunity[]
        return opportunities
      }
      throw err
    }
  },

  updateOpportunity: async (opportunityId: string, update: Partial<Opportunity>): Promise<Opportunity> => {
    try {
      const response = await apiClient.post('/updateOpportunity', { opportunityId, ...update })
      return response.data
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const opportunities = JSON.parse(localStorage.getItem('localOpportunities') || '[]') as Opportunity[]
        const index = opportunities.findIndex(o => o.id === opportunityId)
        if (index >= 0) {
          opportunities[index] = { ...opportunities[index], ...update, updatedAt: new Date().toISOString() }
          localStorage.setItem('localOpportunities', JSON.stringify(opportunities))
          return opportunities[index]
        }
        throw new Error('Opportunity not found')
      }
      throw err
    }
  },

  deleteOpportunity: async (opportunityId: string): Promise<void> => {
    try {
      await apiClient.post('/deleteOpportunity', { opportunityId })
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const opportunities = JSON.parse(localStorage.getItem('localOpportunities') || '[]') as Opportunity[]
        const filtered = opportunities.filter(o => o.id !== opportunityId)
        localStorage.setItem('localOpportunities', JSON.stringify(filtered))
        return
      }
      throw err
    }
  },

  // Accounts API
  getAllAccounts: async (): Promise<Account[]> => {
    try {
      const response = await apiClient.post('/searchAccount', {})
      return response.data || []
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const accounts = JSON.parse(localStorage.getItem('localAccounts') || '[]') as Account[]
        return accounts
      }
      throw err
    }
  },

  updateAccount: async (accountId: string, update: Partial<Account>): Promise<Account> => {
    try {
      const response = await apiClient.post('/updateAccount', { accountId, ...update })
      return response.data
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const accounts = JSON.parse(localStorage.getItem('localAccounts') || '[]') as Account[]
        const index = accounts.findIndex(a => a.id === accountId)
        if (index >= 0) {
          accounts[index] = { ...accounts[index], ...update, updatedAt: new Date().toISOString() }
          localStorage.setItem('localAccounts', JSON.stringify(accounts))
          return accounts[index]
        }
        throw new Error('Account not found')
      }
      throw err
    }
  },

  deleteAccount: async (accountId: string): Promise<void> => {
    try {
      await apiClient.post('/deleteAccount', { accountId })
    } catch (err: any) {
      // Fallback to localStorage
      if (err.response?.status === 404 || err.message?.includes('404')) {
        const accounts = JSON.parse(localStorage.getItem('localAccounts') || '[]') as Account[]
        const filtered = accounts.filter(a => a.id !== accountId)
        localStorage.setItem('localAccounts', JSON.stringify(filtered))
        return
      }
      throw err
    }
  },
}
