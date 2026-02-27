# Cross-Browser Testing Guide

## Important: localStorage is Browser-Specific

**localStorage is stored per browser/domain.** This means:
- Pages created in **Browser 1** are stored in **Browser 1's localStorage**
- Pages created in **Browser 2** are stored in **Browser 2's localStorage**
- **They don't share data automatically**

## Solution for Testing

### Option 1: Test in Same Browser (Recommended)

1. **Open Browser in Incognito/Private Mode**
2. **Login as Admin** → Create page → Add customer as member
3. **Logout** (don't close browser)
4. **Login as Customer** → You should see the page

### Option 2: Manual Page Copy (For Cross-Browser Testing)

Since localStorage is browser-specific, you need to manually copy pages:

1. **In Admin Browser:**
   - Open DevTools (F12)
   - Console tab
   - Run: `localStorage.getItem('localPages')`
   - Copy the JSON output

2. **In Customer Browser:**
   - Open DevTools (F12)
   - Console tab
   - Run: `localStorage.setItem('localPages', '<paste the copied JSON>')`
   - Refresh the page
   - Customer should now see the page

### Option 3: Use Same Browser with Different Accounts

1. **Login as Admin** → Create page with customer email
2. **Logout**
3. **Login as Customer** → Should see the page

## How to Verify Page Creation

### Check if Page was Created:

1. **In Admin Browser (where page was created):**
   ```javascript
   // Open Console (F12)
   const pages = JSON.parse(localStorage.getItem('localPages') || '[]')
   console.log('Pages:', pages)
   console.log('Page members:', pages[0]?.members)
   ```

2. **Verify Members:**
   - Check that `members` array contains the customer's email
   - Format should be: `[{ userId: "customer@example.com", role: "Member" }]`

### Check if Customer Can See Page:

1. **In Customer Browser:**
   ```javascript
   // Open Console (F12)
   const pages = JSON.parse(localStorage.getItem('localPages') || '[]')
   const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
   
   console.log('Customer email:', user.email)
   console.log('All pages:', pages)
   console.log('Pages with customer as member:', 
     pages.filter(p => 
       p.members?.some(m => {
         const memberId = typeof m === 'string' ? m : m.userId
         return memberId === user.email || memberId === user.id
       })
     )
   )
   ```

## Quick Fix: Copy Page to Customer Browser

If you created a page in admin browser and customer can't see it:

1. **Admin Browser Console:**
   ```javascript
   // Get the page data
   const pages = JSON.parse(localStorage.getItem('localPages') || '[]')
   const pageToShare = pages.find(p => p.name === 'Test page') // Change to your page name
   console.log('Page to share:', JSON.stringify(pageToShare, null, 2))
   // Copy the output
   ```

2. **Customer Browser Console:**
   ```javascript
   // Paste the page data
   const pageData = { /* paste the copied page object here */ }
   const existingPages = JSON.parse(localStorage.getItem('localPages') || '[]')
   existingPages.push(pageData)
   localStorage.setItem('localPages', JSON.stringify(existingPages))
   // Refresh the page
   location.reload()
   ```

## Expected Behavior

✅ **Same Browser:**
- Admin creates page → Customer logs in → Customer sees page

❌ **Different Browsers:**
- Admin creates page in Browser 1 → Customer views in Browser 2 → Customer doesn't see page (localStorage is separate)

## Permanent Solution

For production, you need:
- **Backend API** to store pages (currently 404)
- **Database** to persist pages across browsers
- **Real-time sync** via WebSocket/MQTT

For now, use **Option 1** (same browser) for testing.
