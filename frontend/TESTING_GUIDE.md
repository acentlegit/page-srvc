# Testing Guide - Staging Connection & MQTT

## 🧪 Quick Test Checklist

### ✅ Test 1: MQTT Connection (5 minutes)

**Steps:**
1. Open `http://localhost:5173` in your browser
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for these messages:

**✅ Success Indicators:**
```
🔌 Attempting MQTT connection to: wss://mqtt.staging.beamdev.hu:443/mqtt
✅ MQTT connected successfully to: wss://mqtt.staging.beamdev.hu:443/mqtt
✅ MQTT connected: wss://mqtt.staging.beamdev.hu:443/mqtt
✅ Subscribed to service/page/events/MessageCreated/...
```

**❌ Failure Indicators:**
```
⚠️ Connection failed: Connection timeout
🔄 Trying next URL...
❌ Failed to connect to MQTT broker. Tried X URL(s).
```

**If it fails:**
- Check VPN connection (if required)
- Try the visual test tool: `http://localhost:5173/mqtt-test.html`

---

### ✅ Test 2: Visual MQTT Test Tool (2 minutes)

**Steps:**
1. Open `http://localhost:5173/mqtt-test.html` in your browser
2. Click **"Test All URLs"** button
3. Wait for results (about 10-15 seconds)

**What to look for:**
- **Green background** = URL works ✅
- **Red background** = URL failed ❌
- **Yellow background** = Currently testing

**If you see a green URL:**
- That's your working MQTT URL!
- The system will use it automatically

---

### ✅ Test 3: API Connection to Staging (3 minutes)

**Steps:**
1. Open `http://localhost:5173` in your browser
2. Press `F12` → **Network** tab
3. Navigate to any page (e.g., Pages list)
4. Look for API requests

**✅ Success Indicators:**
- Requests going to: `cudb-root-api.staging.beamdev.hu`
- Status codes: `200`, `201`, `404` (404 is OK for some endpoints)
- Responses received

**❌ Failure Indicators:**
- `CORS error` = May need VPN or CORS configuration
- `Network Error` = Check VPN/network connection
- `401 Unauthorized` = May need authentication

**Check in Console:**
- Look for: `API call to: https://cudb-root-api.staging.beamdev.hu/...`

---

### ✅ Test 4: Real-Time Messaging (10 minutes)

**This is the most important test!**

**Setup:**
1. **Window 1** (Regular browser):
   - Open `http://localhost:5173`
   - Set user ID: Open Console, run:
     ```javascript
     localStorage.setItem('currentUserId', 'userA@test.com')
     ```
   - Navigate to a page (or create one)

2. **Window 2** (Incognito/Private browser):
   - Open `http://localhost:5173`
   - Set different user ID: Open Console, run:
     ```javascript
     localStorage.setItem('currentUserId', 'userB@test.com')
     ```
   - Navigate to the **same page**

**Test:**
1. **Window 1**: Type a message and send
   - Message should appear on **RIGHT** (blue bubble)
   - Should show "You • [time]"

2. **Window 2**: Should see the message
   - Message should appear on **LEFT** (gray bubble)
   - Should show "userA@test.com • [time]"
   - Should appear within 1-2 seconds (real-time!)

3. **Window 2**: Reply with a message
   - Message should appear on **RIGHT** (blue bubble) in Window 2
   - Should appear on **LEFT** (gray bubble) in Window 1

**✅ Success Indicators:**
- Messages appear instantly (1-2 seconds)
- Messages show on correct sides (right for you, left for others)
- Author names display correctly
- Console shows: `📨 [REAL-TIME] New message received via MQTT`

**❌ Failure Indicators:**
- Messages don't appear in other window
- Messages only appear after page refresh
- Console shows MQTT errors

---

### ✅ Test 5: Create Page & View (5 minutes)

**Steps:**
1. Navigate to Pages section
2. Create a new page with a name (e.g., "Test Page")
3. Open the page
4. Check that:
   - Page name displays correctly
   - Page loads without errors
   - Members section shows
   - Messages section is visible

**✅ Success Indicators:**
- Page created successfully
- Page name shows in header
- No console errors

---

### ✅ Test 6: Invitation System (10 minutes)

**Steps:**
1. Open a page
2. Click **"+ Invite"** button
3. Fill in:
   - Method: Email
   - Nickname: Test User
   - Email: test@example.com
4. Click **"Invite"**
5. Copy the invitation link from alert
6. Open invitation link in **new browser window** (or incognito)
7. Click **"View Page"**

**✅ Success Indicators:**
- Invitation link generated
- Invitation page loads
- "View Page" button works
- User is added to page
- Page name displays correctly
- User can send messages

---

## 🎯 Complete Test Scenario

### Full Workflow Test (15 minutes)

1. **Create Page**:
   - Create page named "Integration Test"
   - Note the page ID

2. **Send Invitation**:
   - Invite a test email
   - Copy invitation link

3. **Accept Invitation** (in new window):
   - Open invitation link
   - Click "View Page"
   - Verify page name shows "Integration Test"

4. **Real-Time Messaging**:
   - Send message from original window
   - Verify it appears in invitation window
   - Reply from invitation window
   - Verify it appears in original window

5. **Verify MQTT**:
   - Check console in both windows
   - Should see: `📨 [REAL-TIME] New message received via MQTT`

---

## 📊 Console Logs to Watch For

### Good Logs (Everything Working):
```
✅ MQTT connected: wss://mqtt.staging.beamdev.hu:443/mqtt
✅ Subscribed to service/page/events/MessageCreated/...
📡 Subscribing to real-time updates for page: [pageId]
📨 [REAL-TIME] New message received via MQTT
✅ [REAL-TIME] Message added successfully
```

### Warning Logs (May Need Attention):
```
⚠️ Connection failed: Connection timeout
🔄 Trying next URL...
⚠️ API call failed, using local storage
```

### Error Logs (Needs Fixing):
```
❌ MQTT error: [error details]
❌ Failed to connect to MQTT broker
❌ [REAL-TIME] Failed to process real-time message
```

---

## 🔧 Troubleshooting

### MQTT Not Connecting?
1. Check VPN connection
2. Try visual test tool: `http://localhost:5173/mqtt-test.html`
3. Check browser console for specific error
4. Verify `.env` file has correct MQTT URL

### Messages Not Appearing in Real-Time?
1. Check MQTT connection (Test 1)
2. Verify both users are on same page
3. Check console for MQTT subscription messages
4. Try refreshing both windows

### API Calls Failing?
1. Check VPN connection
2. Verify API URL in `.env`: `https://cudb-root-api.staging.beamdev.hu`
3. Check Network tab for CORS errors
4. Verify you have access to staging environment

---

## ✅ Success Criteria

Your setup is working correctly if:

- ✅ MQTT connects automatically
- ✅ API calls go to staging backend
- ✅ Real-time messages appear instantly
- ✅ Messages show on correct sides (right/left)
- ✅ Invitations work end-to-end
- ✅ Page names display correctly

---

## 🚀 Quick Test Command

Open browser console and run:
```javascript
// Check MQTT connection
console.log('MQTT Status:', localStorage.getItem('mqttConnected') || 'Not stored');

// Check current user
console.log('Current User:', localStorage.getItem('currentUserId'));

// Check API base URL (from env)
console.log('API Base:', import.meta.env.VITE_API_BASE_URL);
```

---

## 📝 Test Results Template

Copy this and fill it out:

```
MQTT Connection: [ ] Working [ ] Failed
API Connection: [ ] Working [ ] Failed
Real-Time Messaging: [ ] Working [ ] Failed
Invitation System: [ ] Working [ ] Failed
Page Creation: [ ] Working [ ] Failed

Notes:
- MQTT URL used: ________________
- Issues found: ________________
- Working features: ________________
```

---

**Happy Testing! 🎉**
