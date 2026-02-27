# Real-Time Communication Testing Guide

## Overview
This guide explains how to test the real-time messaging functionality where multiple users can communicate on the same page.

## Prerequisites
1. Application running on `http://localhost:5177` (or your dev server port)
2. MQTT broker configured (check `.env` file for `VITE_MQTT_BROKER_URL`)
3. Two browser windows/tabs (or two different browsers)

## Step-by-Step Testing Instructions

### Step 1: Create a Page (User A)
1. Open your browser and go to `http://localhost:5177`
2. Navigate to **Communication > Pages**
3. Click **Create Page** or go to `/communication/pages/new`
4. Create a page named **"Test Page"** (or any name)
5. Note the Page ID (you'll see it in the URL or page details)

### Step 2: Send Invitation (User A)
1. On the page detail view, find the **"Participants"** section on the right sidebar
2. Click the green **"+ Invite"** button
3. In the invitation modal:
   - Select **"Email"** method
   - Enter **Nickname**: `Test User B`
   - Enter **Email**: `testuser@example.com` (or any test email)
4. Click **"Invite"**
5. **Copy the invitation link** that appears in the alert
   - Example: `http://localhost:5177/invite/accept?token=...&email=testuser@example.com&pageId=1`

### Step 3: Accept Invitation (User B)
1. **Open a new browser window/tab** (or use Incognito/Private mode)
   - This simulates a different user
2. Paste the invitation link in the address bar
3. You should see the **"Page Invitation"** screen
4. Click **"View Page"** button
5. User B is now added to the page and can see the page

### Step 4: Test Real-Time Messaging

#### Test Scenario 1: User A sends a message
1. **In User A's browser window:**
   - Type a message: `"Hello from User A!"`
   - Click **"Send"** button
   - ✅ Message should appear instantly in User A's chat

2. **In User B's browser window:**
   - ✅ Within 1-2 seconds, you should see the message appear automatically
   - ✅ Message should show as coming from User A (not "You")

#### Test Scenario 2: User B sends a message
1. **In User B's browser window:**
   - Type a message: `"Hello from User B! I can see your message!"`
   - Click **"Send"** button
   - ✅ Message should appear instantly in User B's chat

2. **In User A's browser window:**
   - ✅ Within 1-2 seconds, you should see User B's message appear automatically
   - ✅ Message should show as coming from User B

#### Test Scenario 3: Multiple messages
1. **User A sends:** `"Message 1"`
2. **User B sends:** `"Message 2"`
3. **User A sends:** `"Message 3"`
4. **User B sends:** `"Message 4"`

**Expected Result:**
- ✅ Both users should see all 4 messages in the correct order
- ✅ Messages should appear in real-time (within 1-2 seconds)
- ✅ Each user's own messages show as "You"
- ✅ Other user's messages show with their email/name

## Testing Checklist

### ✅ Real-Time Features to Verify:
- [ ] Messages appear instantly for the sender (optimistic update)
- [ ] Messages appear in other user's window within 1-2 seconds
- [ ] Messages are in correct chronological order
- [ ] Each user sees their own messages as "You"
- [ ] Each user sees other's messages with correct author name
- [ ] No duplicate messages appear
- [ ] Messages persist after page refresh

### ✅ Invitation Features to Verify:
- [ ] Invitation link is generated correctly
- [ ] Invitation page displays correctly
- [ ] User can accept invitation
- [ ] User is added to participants list
- [ ] Both users can see updated participant count

### ✅ MQTT Connection:
- [ ] Check browser console for: `✅ MQTT connected`
- [ ] Check for: `✅ Subscribed to service/page/events/MessageCreated/{pageId}`
- [ ] Check for: `📨 New message received via MQTT` when messages arrive

## Troubleshooting

### Messages not appearing in real-time?
1. **Check MQTT Connection:**
   - Open browser console (F12)
   - Look for MQTT connection messages
   - If you see errors, check `.env` file for `VITE_MQTT_BROKER_URL`

2. **Check Polling Fallback:**
   - Messages should still appear via polling (every 3 seconds)
   - Check console for API calls to `/pages/{pageId}/messages`

3. **Verify Both Users:**
   - Make sure both browser windows are on the same page
   - Check that both have the same `pageId` in the URL

### MQTT Not Working?
- The system has a **polling fallback** that checks for new messages every 3 seconds
- Messages will still sync, just not instantly
- Check `.env` configuration for MQTT settings

## Quick Test Script

### Manual Test Steps:
```
1. User A: Create page "Test Page"
2. User A: Send invite to testuser@example.com
3. User A: Copy invitation link
4. User B: Open link in new browser/incognito
5. User B: Accept invitation
6. User A: Send message "Test 1"
7. User B: Should see "Test 1" within 2 seconds
8. User B: Send message "Test 2"
9. User A: Should see "Test 2" within 2 seconds
10. Both: Verify all messages visible in correct order
```

## Expected Console Output

### User A's Console:
```
✅ MQTT connected: ws://localhost:9001
✅ Subscribed to service/page/events/MessageCreated/1
✅ Subscribed to service/page/events/PageUpdated/1
✅ Message sent successfully: {messageId: "...", text: "Hello from User A!"}
📨 New message received via MQTT: {userId: "testuser@example.com", text: "Hello from User B!"}
```

### User B's Console:
```
✅ MQTT connected: ws://localhost:9001
✅ Subscribed to service/page/events/MessageCreated/1
✅ Subscribed to service/page/events/PageUpdated/1
✅ Message sent successfully: {messageId: "...", text: "Hello from User B!"}
📨 New message received via MQTT: {userId: "admin", text: "Hello from User A!"}
```

## Notes

- **MQTT Topics Used:**
  - `service/page/events/MessageCreated/{pageId}` - New messages
  - `service/page/events/PageUpdated/{pageId}` - Page/member updates

- **Polling Interval:** 3 seconds (fallback if MQTT fails)

- **Optimistic Updates:** Messages appear instantly for sender, then confirmed by server

- **Browser Storage:** 
  - User IDs stored in `localStorage` as `currentUserId`
  - Invitations stored in `localStorage` with key `invitations_{pageId}`

## Success Criteria

✅ **Test is successful if:**
1. Both users can see each other's messages in real-time
2. Messages appear within 1-2 seconds (or 3 seconds via polling)
3. No duplicate messages
4. Messages persist after refresh
5. Both users see correct participant count
