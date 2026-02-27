# Chat Alignment Testing Guide

## How Message Alignment Works

The chat uses **viewer-based alignment**: messages are aligned based on **who is viewing the chat**, not who sent it.

- **Your messages** (sent by the current viewer) → **RIGHT side** (green bubble)
- **Others' messages** (sent by someone else) → **LEFT side** (white bubble)

## Testing Steps

### Prerequisites
1. Make sure you have at least 2 user accounts:
   - One customer account (e.g., `customer1@example.com`)
   - One admin/staff account (e.g., `admin@example.com` or `poojitha@acentle.com`)

2. Both users should be members of the same page

### Test 1: Customer Sends Message

**Steps:**
1. **Login as Customer**
   - Go to: `http://localhost:5173/login`
   - Login with customer email (e.g., `customer1@example.com`)
   - Navigate to a chat page

2. **Send a Message**
   - Type a message: "Hello from customer"
   - Click Send or press Enter

3. **Verify Customer View**
   - ✅ Message should appear on **RIGHT side** (green bubble)
   - ✅ Your name should be shown above the message
   - ✅ Message should say "Hello from customer"

4. **Switch to Admin View**
   - Logout or open in incognito/another browser
   - Login as Admin (e.g., `poojitha@acentle.com`)
   - Navigate to the same page

5. **Verify Admin View**
   - ✅ Customer's message should appear on **LEFT side** (white bubble)
   - ✅ Customer's name should be shown above the message
   - ✅ Message should say "Hello from customer"

### Test 2: Admin Sends Message

**Steps:**
1. **As Admin** (already logged in from Test 1)
   - Type a message: "Hello from admin"
   - Click Send

2. **Verify Admin View**
   - ✅ Message should appear on **RIGHT side** (green bubble)
   - ✅ Your name (admin) should be shown above the message

3. **Switch to Customer View**
   - Logout or switch browser
   - Login as Customer
   - Navigate to the same page

4. **Verify Customer View**
   - ✅ Admin's message should appear on **LEFT side** (white bubble)
   - ✅ Admin's name should be shown above the message

### Test 3: Multiple Messages

**Steps:**
1. **As Customer**: Send "Message 1"
2. **As Admin**: Send "Message 2"
3. **As Customer**: Send "Message 3"
4. **As Admin**: Send "Message 4"

**Expected Result:**
- When viewing as **Customer**:
  - "Message 1" → RIGHT (green)
  - "Message 2" → LEFT (white)
  - "Message 3" → RIGHT (green)
  - "Message 4" → LEFT (white)

- When viewing as **Admin**:
  - "Message 1" → LEFT (white)
  - "Message 2" → RIGHT (green)
  - "Message 3" → LEFT (white)
  - "Message 4" → RIGHT (green)

## Debugging

### Check Console Logs

Open browser DevTools (F12) and check the console. You should see:

```
📤 [SEND MESSAGE] Stored with userId: <userId> User: <user email>
📊 [ALIGNMENT CHECK] {
  messageSenderId: "<sender userId>",
  messageAuthor: "<sender name>",
  currentViewerIds: ["<viewer id>", "<viewer email>", ...],
  currentViewerEmail: "<viewer email>",
  isCurrentUser: true/false,
  alignment: "➡️ RIGHT (your message)" or "⬅️ LEFT (others message)"
}
```

### Common Issues

1. **All messages on same side**
   - Check if `messageSenderId` matches any value in `currentViewerIds`
   - Verify userId is being stored correctly when sending

2. **Messages appearing on wrong side**
   - Check console logs for alignment check
   - Verify user IDs are consistent (same format: email vs ID)

3. **userId is '1' or generic**
   - This might be a pageId, not userId
   - Check how userId is retrieved in `sendMessage` function

## Quick Test Checklist

- [ ] Customer sends message → appears RIGHT for customer
- [ ] Customer sends message → appears LEFT for admin
- [ ] Admin sends message → appears RIGHT for admin
- [ ] Admin sends message → appears LEFT for customer
- [ ] Multiple messages alternate correctly based on sender
- [ ] Names are displayed correctly above each message
- [ ] Green bubbles for your messages, white for others

## Expected Behavior Summary

| Sender | Viewer | Alignment | Bubble Color |
|--------|--------|-----------|--------------|
| Customer | Customer | RIGHT | Green |
| Customer | Admin | LEFT | White |
| Admin | Admin | RIGHT | Green |
| Admin | Customer | LEFT | White |
| Staff | Staff | RIGHT | Green |
| Staff | Customer | LEFT | White |
| Staff | Admin | LEFT | White |
