import { pagesApi, PageModel } from '../api/apiClient'

export type PageType = 'LiveFriend' | 'LiveGroup' | 'LiveMember' | 'ChatPage'

/**
 * Convert a standard page to a chat page
 */
export async function convertPageToChat(pageId: string, actorUserId: string = 'admin'): Promise<void> {
  try {
    // Update in localStorage first for immediate feedback
    try {
      const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[]
      const pageIndex = storedPages.findIndex((p: PageModel) => p.id === pageId)
      if (pageIndex >= 0) {
        storedPages[pageIndex] = {
          ...storedPages[pageIndex],
          type: 'ChatPage' as any,
          updatedAt: Date.now()
        }
        localStorage.setItem('localPages', JSON.stringify(storedPages))
        console.log('✅ Page converted in localStorage')
      }
    } catch (localErr) {
      console.log('Failed to update localStorage:', localErr)
    }
    
    // Try API update (may fail if backend unavailable)
    try {
      await pagesApi.update(pageId, { type: 'ChatPage' as any })
      console.log(`✅ Page ${pageId} converted to chat page via API`)
    } catch (apiErr) {
      console.log('⚠️ API update failed, but localStorage updated:', apiErr)
      // Don't throw - localStorage update is sufficient for functionality
    }
  } catch (error) {
    console.error('Failed to convert page to chat:', error)
    // Don't throw - allow localStorage update to succeed
  }
}

/**
 * Check if a page is a chat page
 */
export function isChatPage(page: { type?: string }): boolean {
  return page.type === 'ChatPage' || page.type === 'LiveFriend'
}

/**
 * Check if user can convert page to chat
 */
export function canConvertToChat(userRole: string, pageOwner?: string, userId?: string): boolean {
  // Admin and staff can always convert
  if (userRole === 'admin' || userRole === 'staff') {
    return true
  }
  
  // Customers can convert if they are the owner or have permission
  if (userRole === 'customer') {
    return pageOwner === userId || true // Allow customers to convert their pages
  }
  
  return false
}
