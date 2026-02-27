# Quick Test Example - Real-Time Messaging

## 🚀 Fastest Way to Test (5 Minutes)

### Setup (One Time)
1. Make sure your app is running: `npm run dev`
2. Open **TWO browser windows** side by side

---

## 📝 Step-by-Step Test

### Window 1: User A (Admin)
```
1. Go to: http://localhost:5177/communication/pages
2. Click "Create Page" or go to /communication/pages/new
3. Create page: Name = "Test Chat Page"
4. You'll be redirected to the page detail view
5. In the right sidebar, find "Participants (1)"
6. Click green "+ Invite" button
7. Fill form:
   - Method: Email
   - Nickname: Test User
   - Email: test@example.com
8. Click "Invite"
9. COPY the invitation link from the alert
   Example: http://localhost:5177/invite/accept?token=123&email=test@example.com&pageId=1
```

### Window 2: User B (Invited User)
```
1. Paste the invitation link in address bar
2. Click "View Page" button
3. You're now on the same page as User A
4. You should see "Participants (2)" in the sidebar
```

### Test Real-Time Messaging

#### Test 1: User A sends message
**In Window 1 (User A):**
- Type: `"Hello! Can you see this?"`
- Click "Send"
- ✅ Message appears instantly

**In Window 2 (User B):**
- ✅ Wait 1-2 seconds
- ✅ Message should appear automatically!
- ✅ Shows as coming from "admin" (or User A's email)

#### Test 2: User B sends message
**In Window 2 (User B):**
- Type: `"Yes! I can see it! This is working!"`
- Click "Send"
- ✅ Message appears instantly

**In Window 1 (User A):**
- ✅ Wait 1-2 seconds
- ✅ Message should appear automatically!
- ✅ Shows as coming from "test@example.com" (User B)

#### Test 3: Rapid messages
**Both users send messages quickly:**
- User A: `"Message 1"`
- User B: `"Message 2"`
- User A: `"Message 3"`
- User B: `"Message 4"`

**Expected:**
- ✅ Both see all 4 messages in order
- ✅ Messages appear within 1-2 seconds
- ✅ No duplicates

---

## 🔍 What to Check in Browser Console

### Open Console (F12) in Both Windows

**You should see:**

#### Window 1 (User A):
```
✅ MQTT connected: ws://localhost:9001
📡 Subscribing to real-time updates for page: 1
✅ Subscribed to service/page/events/MessageCreated/1
✅ Subscribed to service/page/events/PageUpdated/1
✅ [SEND] Message sent successfully to server
✅ [SEND] Message will be broadcast via MQTT to all participants
📨 [REAL-TIME] New message received via MQTT: {userId: "test@example.com", text: "Yes! I can see it!"}
✅ [REAL-TIME] Message added successfully. Total messages: 2
```

#### Window 2 (User B):
```
✅ MQTT connected: ws://localhost:9001
📡 Subscribing to real-time updates for page: 1
✅ Subscribed to service/page/events/MessageCreated/1
✅ Subscribed to service/page/events/PageUpdated/1
📨 [REAL-TIME] New message received via MQTT: {userId: "admin", text: "Hello! Can you see this?"}
✅ [REAL-TIME] Message added successfully. Total messages: 1
✅ [SEND] Message sent successfully to server
```

---

## ✅ Success Indicators

### ✅ Real-Time Working:
- Messages appear in other window within 1-2 seconds
- Console shows `📨 [REAL-TIME] New message received via MQTT`
- No need to refresh page
- Messages stay in sync

### ✅ Polling Fallback Working (if MQTT fails):
- Messages appear within 3 seconds
- Console shows API calls every 3 seconds
- Still works, just slower

### ❌ Not Working:
- Messages don't appear in other window
- Need to refresh to see new messages
- Console shows MQTT errors

---

## 🐛 Troubleshooting

### Problem: Messages not appearing in real-time

**Solution 1: Check MQTT Connection**
```javascript
// In browser console, check:
console.log('MQTT Status:', mqttService.isConnected)
// Should show: true
```

**Solution 2: Check Polling**
- Even if MQTT fails, polling should work
- Messages will appear every 3 seconds
- Check Network tab for API calls to `/pages/{pageId}/messages`

**Solution 3: Verify Same Page**
- Both windows must have same `pageId` in URL
- Check URL: `/communication/pages/demo?pageId=1` (both should match)

### Problem: Duplicate messages

**Solution:**
- This shouldn't happen (code prevents duplicates)
- If it does, check console for: `⚠️ [REAL-TIME] Message already exists`

---

## 📊 Test Results Template

```
Test Date: ___________
Page ID: ___________

✅ User A can send messages
✅ User B receives User A's messages in real-time
✅ User B can send messages  
✅ User A receives User B's messages in real-time
✅ Messages appear within 2 seconds
✅ No duplicate messages
✅ Messages persist after refresh
✅ Participant count updates correctly

MQTT Status: [ ] Working [ ] Not Working (using polling)
```

---

## 🎯 Expected Behavior Summary

1. **User A sends message** → Appears instantly in Window 1
2. **MQTT broadcasts** → Window 2 receives within 1-2 seconds
3. **User B sends message** → Appears instantly in Window 2
4. **MQTT broadcasts** → Window 1 receives within 1-2 seconds
5. **Both users** → See all messages in correct order
6. **Refresh page** → Messages still there (persisted)

---

## 💡 Pro Tips

1. **Use Incognito Mode** for Window 2 to simulate different user
2. **Keep Console Open** to see real-time logs
3. **Test with 3+ users** by opening more windows
4. **Test slow network** by throttling in DevTools
5. **Test MQTT failure** by disconnecting network briefly

---

## 🎉 Success!

If all tests pass, your real-time communication is working perfectly! 
Users can now communicate in real-time just like in the staging environment.
