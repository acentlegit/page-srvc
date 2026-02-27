// Activity Tracking System for CRM
// Tracks all actions performed on Leads, Opportunities, and Accounts

export interface Activity {
  id: string
  type: 'lead' | 'opportunity' | 'account'
  entityId: string
  entityName: string
  action: 'created' | 'updated' | 'deleted' | 'converted' | 'email_sent' | 'status_changed' | 'stage_changed'
  userId: string
  userName: string
  description: string
  changes?: Record<string, { old: any; new: any }>
  timestamp: string
}

const ACTIVITY_STORAGE_KEY = 'crmActivities'

export const activityTracking = {
  // Log an activity
  log: (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    try {
      const activities = activityTracking.getAll()
      const newActivity: Activity = {
        ...activity,
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      }
      activities.push(newActivity)
      
      // Keep only last 1000 activities to prevent storage bloat
      const trimmed = activities.slice(-1000)
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(trimmed))
      
      return newActivity
    } catch (err) {
      console.error('Failed to log activity:', err)
      return null
    }
  },

  // Get all activities
  getAll: (): Activity[] => {
    try {
      return JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY) || '[]') as Activity[]
    } catch (err) {
      console.error('Failed to get activities:', err)
      return []
    }
  },

  // Get activities for a specific entity
  getByEntity: (type: Activity['type'], entityId: string): Activity[] => {
    const activities = activityTracking.getAll()
    return activities.filter(
      activity => activity.type === type && activity.entityId === entityId
    )
  },

  // Get activities by user
  getByUser: (userId: string): Activity[] => {
    const activities = activityTracking.getAll()
    return activities.filter(activity => activity.userId === userId)
  },

  // Get recent activities (last N)
  getRecent: (limit: number = 50): Activity[] => {
    const activities = activityTracking.getAll()
    return activities.slice(-limit).reverse()
  },

  // Get activities by action type
  getByAction: (action: Activity['action']): Activity[] => {
    const activities = activityTracking.getAll()
    return activities.filter(activity => activity.action === action)
  },

  // Clear all activities
  clear: () => {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY)
  },
}

// Helper function to get current user info
export const getCurrentUserInfo = () => {
  try {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const user = JSON.parse(userStr)
      return {
        id: user.id || user.email || 'unknown',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
      }
    }
  } catch (err) {
    console.error('Failed to get current user info:', err)
  }
  return {
    id: 'unknown',
    name: 'Unknown User',
  }
}

// Helper function to create activity descriptions
export const createActivityDescription = (
  action: Activity['action'],
  entityName: string,
  changes?: Record<string, { old: any; new: any }>
): string => {
  switch (action) {
    case 'created':
      return `Created ${entityName}`
    case 'updated':
      if (changes) {
        const changeKeys = Object.keys(changes)
        if (changeKeys.length === 1) {
          return `Updated ${changeKeys[0]} of ${entityName}`
        }
        return `Updated ${changeKeys.length} fields of ${entityName}`
      }
      return `Updated ${entityName}`
    case 'deleted':
      return `Deleted ${entityName}`
    case 'converted':
      return `Converted ${entityName} to Account and Opportunity`
    case 'email_sent':
      return `Sent email to ${entityName}`
    case 'status_changed':
      return `Changed status of ${entityName}`
    case 'stage_changed':
      return `Changed stage of ${entityName}`
    default:
      return `Performed action on ${entityName}`
  }
}
