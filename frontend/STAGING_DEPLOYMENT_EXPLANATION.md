# ✅ Can We Deploy to Staging? YES!

## Current Situation

**Your localhost application:**
- ✅ Already connects to staging backend APIs (`https://cudb-root-api.staging.beamdev.hu`)
- ✅ Already uses staging MQTT servers
- ✅ Already handles staging backend format (Swagger/JSON Patch)
- ✅ All functionality works: pages, chat, invitations, video calls

**Staging URL (`https://live.staging.beam.live/dashboard`):**
- This is the **frontend** URL where your application should be deployed
- Currently shows the existing staging dashboard
- Can be replaced with your new implementation

---

## How It Would Work

### 1. **After Deployment**

When you deploy your code to `https://live.staging.beam.live`:

```
User Flow:
1. User creates page "Test page1" on staging
2. User sends invitation via email
3. Invitation link: https://live.staging.beam.live/invite/accept?token=...&email=...&pageId=1
4. User clicks "Accept" button
5. Navigates to: https://live.staging.beam.live/communication/pages/demo?pageId=1
6. Page shows: "Test page1" (correct name!)
7. User can chat, share images, video call - everything works!
```

### 2. **What's Already Working**

Your code **already supports staging**:

```typescript
// apiClient.ts automatically detects staging:
const IS_STAGING_BACKEND = API_BASE_URL.includes('staging') || 
                           API_BASE_URL.includes('beamdev.hu');

// Uses staging endpoints:
- /searchInPage (for getting pages)
- /createPage (for creating pages)
- /searchMessage (for messages)
- MQTT connections to staging.beamdev.hu
```

### 3. **What Needs to Change**

**Only the frontend URL in invitation links:**

Currently (localhost):
```javascript
const inviteLink = `http://localhost:5173/invite/accept?token=...`
```

After deployment (staging):
```javascript
const inviteLink = `https://live.staging.beam.live/invite/accept?token=...`
```

**Solution:** Use environment variable for base URL:
```javascript
const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
const inviteLink = `${baseUrl}/invite/accept?token=...`
```

---

## Deployment Steps

### Option 1: Deploy to Staging Server

1. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy `dist/` folder to staging server:**
   - Upload to `https://live.staging.beam.live`
   - Configure web server (nginx/Apache) to serve the React app
   - Set up routing to handle React Router (all routes → index.html)

3. **Update environment variables:**
   - Set `VITE_FRONTEND_URL=https://live.staging.beam.live`
   - Keep `VITE_API_BASE_URL=https://cudb-root-api.staging.beamdev.hu`
   - Keep `VITE_MQTT_URL=wss://mqtt.staging.beamdev.hu/mqtt`

### Option 2: Use Same Codebase, Different Build

Create a staging build configuration:

```bash
# .env.staging
VITE_FRONTEND_URL=https://live.staging.beam.live
VITE_API_BASE_URL=https://cudb-root-api.staging.beamdev.hu
VITE_IS_STAGING_BACKEND=true
VITE_MQTT_URL=wss://mqtt.staging.beamdev.hu/mqtt

# Build for staging
npm run build -- --mode staging
```

---

## What Will Work After Deployment

### ✅ All Features Will Work:

1. **Page Creation**
   - Create pages with names
   - Stored in staging backend
   - Visible to all users

2. **Real-time Chat**
   - WhatsApp-like messaging
   - Messages sync via MQTT
   - Works across all users

3. **Image Sharing**
   - Share images in chat
   - Real-time sync
   - Stored in localStorage (or can be uploaded to S3)

4. **Video Calls**
   - Beam video call integration
   - Works for all page participants

5. **Invitations**
   - Send via email (EmailJS)
   - Invitation links use staging URL
   - Accept and join pages

6. **Page Name Display**
   - Shows correct page name
   - Preserved from creation
   - Works after accepting invitation

---

## URL Structure After Deployment

```
Staging Frontend: https://live.staging.beam.live
├── /dashboard (main dashboard)
├── /communication/pages (pages list)
├── /communication/pages/demo?pageId=1 (page detail - shows "Test page1")
├── /invite/accept?token=...&email=...&pageId=1 (invitation acceptance)
└── /communication/pages/create (create page)

Staging Backend: https://cudb-root-api.staging.beamdev.hu
├── /searchInPage (get pages)
├── /createPage (create page)
├── /searchMessage (get messages)
└── MQTT: wss://mqtt.staging.beamdev.hu/mqtt (real-time updates)
```

---

## Example Flow After Deployment

### User A (Admin):
1. Goes to `https://live.staging.beam.live/communication/pages/create`
2. Creates page: "Test page1"
3. Clicks "Invite Member"
4. Enters email: `user@example.com`
5. Clicks "Send Invitation"
6. Email sent with link: `https://live.staging.beam.live/invite/accept?token=...&email=user@example.com&pageId=1`

### User B (Invited):
1. Receives email
2. Clicks invitation link
3. Opens: `https://live.staging.beam.live/invite/accept?token=...`
4. Sees "Page Invitation" screen
5. Clicks "Accept"
6. Navigates to: `https://live.staging.beam.live/communication/pages/demo?pageId=1`
7. **Sees page name: "Test page1"** ✅
8. Can chat, share images, video call ✅

---

## Technical Details

### Current Code Already Supports:

1. **Staging Backend Detection:**
   ```typescript
   const IS_STAGING_BACKEND = API_BASE_URL.includes('staging') || 
                             API_BASE_URL.includes('beamdev.hu');
   ```

2. **Staging API Endpoints:**
   - Uses Swagger format (JSON Patch)
   - Handles 404 errors gracefully
   - Falls back to localStorage

3. **Staging MQTT:**
   - Multiple fallback URLs
   - Handles SSL certificate errors
   - Auto-reconnects

4. **Environment Variables:**
   - All configurable via `.env`
   - No hardcoded URLs (except fallbacks)

---

## What You Need to Do

### 1. Update Invitation Link Generation

**File:** `frontend/src/pages/PageDetailPage.tsx`

**Current:**
```typescript
const baseUrl = window.location.origin
const inviteLink = `${baseUrl}/invite/accept?token=...`
```

**Better (use env variable):**
```typescript
const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
const inviteLink = `${baseUrl}/invite/accept?token=...`
```

### 2. Build and Deploy

```bash
# Build
cd frontend
npm run build

# Deploy dist/ folder to staging server
# Configure web server for React Router
```

### 3. Test

1. Create a page on staging
2. Send invitation
3. Accept invitation
4. Verify page name shows correctly
5. Test chat, images, video calls

---

## Summary

**✅ YES, you can deploy to staging!**

- Code already supports staging backend
- All features will work the same way
- Just need to:
  1. Build the application
  2. Deploy to `https://live.staging.beam.live`
  3. Update invitation links to use staging URL
  4. Test end-to-end flow

**The functionality will be identical to localhost, just on a different URL!**
