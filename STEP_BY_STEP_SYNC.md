# Step-by-Step: Sync Pages Across Browsers

## The Problem
Admin creates a page in **Browser 1** → Customer views in **Browser 2** → Customer sees no pages (because localStorage is browser-specific).

## Solution: Copy Shared Registry

### Step 1: Get Registry from Admin Browser

1. **In Admin Browser** (where you created the page):
   - Open **DevTools** (Press `F12`)
   - Go to **Console** tab
   - Type and press Enter:
     ```javascript
     localStorage.getItem('sharedPagesRegistry')
     ```
   - You'll see output like: `"[{\"id\":\"1\",\"name\":\"Test page\",...}]"`
   - **Copy this entire output** (it's a JSON string)

### Step 2: Paste in Customer Browser

1. **In Customer Browser**:
   - Open **DevTools** (Press `F12`)
   - Go to **Console** tab
   - Type and press Enter (replace `<paste>` with what you copied):
     ```javascript
     localStorage.setItem('sharedPagesRegistry', '<paste>')
     ```
   - You should see: `undefined` (that's normal)
   - **Go back to the page** and click **"🔄 Sync Pages"** button
   - Pages should appear!

## Quick Copy-Paste Example

**Admin Browser Console:**
```javascript
localStorage.getItem('sharedPagesRegistry')
// Output: "[{\"id\":\"1\",\"name\":\"Test page\",\"members\":[{\"userId\":\"customer@example.com\",\"role\":\"Member\"}]}]"
```

**Customer Browser Console:**
```javascript
localStorage.setItem('sharedPagesRegistry', "[{\"id\":\"1\",\"name\":\"Test page\",\"members\":[{\"userId\":\"customer@example.com\",\"role\":\"Member\"}]}]")
// Then click "Sync Pages" button
```

## Alternative: Same Browser Testing

For **quick testing**, use the same browser:

1. Open browser in **Incognito/Private mode**
2. Login as **Admin** → Create page → Add customer email
3. **Logout** (keep browser open)
4. Login as **Customer** → Should see the page!

**This works because same browser = same localStorage**

## Verify It Worked

After syncing, check console:
```javascript
// Should show pages
const pages = JSON.parse(localStorage.getItem('localPages') || '[]')
console.log('Pages found:', pages.length)

// Should show the page
const page = pages[0]
console.log('Page:', page.name)
console.log('Members:', page.members)
```

## Why This Is Needed

**localStorage is browser-specific** - each browser has its own isolated storage. This is a browser security feature.

For **production**, you need a **backend API** that stores pages in a database (currently returns 404, so we use this workaround).
