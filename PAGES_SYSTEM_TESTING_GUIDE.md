# 📄 Pages System - Testing Guide

## Overview
The Pages System allows Admin/Staff to create communication channels, assign members (customers/staff), and enable real-time collaboration through chat.

---

## ✅ System Components

### 1. **Page Creation** (`/communication/pages/new`)
- Admin/Staff can create pages
- Assign members by email
- Set page name and description
- Store in localStorage + backend

### 2. **Page Listing** (`/communication/pages`)
- View all pages
- See member count
- Click to view page details

### 3. **Page Details** (`/customer/pages/:pageId` or `/staff/pages/:pageId`)
- View page information
- Add/remove members
- Real-time chat
- Convert to chat page

### 4. **Member Assignment**
- Add members by email
- Remove members
- Members can access assigned pages

---

## 🧪 Testing Steps

### **Test 1: Create a Page (Admin/Staff)**

**Steps:**
1. **Login as Admin or Staff**
   - Go to: `http://localhost:5173/login`
   - Login with admin/staff credentials
   - Or sign up as Admin/Staff

2. **Navigate to Create Page**
   - Go to: `http://localhost:5173/communication/pages/new`
   - Or click "Create Page" from pages list

3. **Fill Page Details**
   - **Page Name**: "Support Team Chat"
   - **Description**: "Customer support communication channel"
   - **Add Members**: Enter email addresses (one per line or separate entries)
     - Example: `customer1@example.com`
     - Example: `staff1@example.com`

4. **Save Page**
   - Click "Save" or "Create Page" button
   - Page should be created successfully
   - You'll see a success message with page details

**Expected Result:**
- ✅ Page created with ID
- ✅ Members assigned
- ✅ Page stored in localStorage
- ✅ Page appears in pages list

---

### **Test 2: View Pages List**

**Steps:**
1. **Navigate to Pages List**
   - Go to: `http://localhost:5173/communication/pages`
   - Or from sidebar: "Communication" → "Pages"

2. **Verify Page Display**
   - Should see your created page
   - Shows: ID, Name, Member count, Last Activity, Status

3. **Click on a Page**
   - Click any page row
   - Should navigate to page detail view

**Expected Result:**
- ✅ All created pages visible
- ✅ Correct member counts
- ✅ Clickable rows navigate to details

---

### **Test 3: Assign Members to Page**

**Steps:**
1. **Open Page Details**
   - From pages list, click on a page
   - Or go to: `http://localhost:5173/communication/pages/demo?pageId=YOUR_PAGE_ID`

2. **Add Member**
   - Find "Add Member" section
   - Enter email: `newmember@example.com`
   - Click "Add" button

3. **Verify Member Added**
   - Member should appear in members list
   - Member count should update

**Expected Result:**
- ✅ Member added to page
- ✅ Member appears in list
- ✅ Can remove member if needed

---

### **Test 4: Customer Views Assigned Pages**

**Steps:**
1. **Login as Customer**
   - Go to: `http://localhost:5173/login`
   - Login with customer email that was added to a page
   - Or sign up as Customer

2. **View Customer Dashboard**
   - Go to: `http://localhost:5173/customer/dashboard`
   - Should see "My Assigned Pages" section

3. **Check Assigned Pages**
   - Pages where customer is a member should appear
   - Shows page name and type

4. **Open a Page**
   - Click "View Page" on any assigned page
   - Should open page detail with chat

**Expected Result:**
- ✅ Only assigned pages visible
- ✅ Can access page details
- ✅ Can use chat functionality

---

### **Test 5: Convert Page to Chat Page**

**Steps:**
1. **As Customer or Admin**
   - Open a standard page (not chat page)

2. **Convert to Chat**
   - On Customer Dashboard, click "Convert to Chat" button
   - Or use the conversion utility

3. **Verify Conversion**
   - Page type should change to "ChatPage"
   - Chat functionality should be enabled

**Expected Result:**
- ✅ Page type updated
- ✅ Chat features available
- ✅ Real-time messaging works

---

### **Test 6: Real-Time Chat on Page**

**Steps:**
1. **Open Page with Chat**
   - Navigate to a chat page or converted page
   - URL: `/customer/pages/:pageId` or `/staff/pages/:pageId`

2. **Send Message**
   - Type message in chat input
   - Click "Send" or press Enter
   - Message should appear immediately

3. **Test with Multiple Users** (if possible)
   - Open same page in different browser/incognito
   - Login as different user (member of same page)
   - Send message from one user
   - Should appear instantly for other user

**Expected Result:**
- ✅ Messages send successfully
- ✅ Messages appear in real-time
- ✅ Message history persists
- ✅ Supports images/files

---

### **Test 7: Staff Views Assigned Pages**

**Steps:**
1. **Login as Staff**
   - Go to: `http://localhost:5173/login`
   - Login with staff email that was added to a page

2. **View Staff Dashboard**
   - Go to: `http://localhost:5173/staff/dashboard`
   - Should see "Assigned Pages" section

3. **Access Page**
   - Click on assigned page
   - Should open page with chat
   - Can communicate with customers

**Expected Result:**
- ✅ Staff sees assigned pages
- ✅ Can access and chat
- ✅ Can view customer messages

---

## 🔍 Verification Checklist

### Page Creation
- [ ] Can create page with name
- [ ] Can add members during creation
- [ ] Page saved successfully
- [ ] Page appears in list

### Member Management
- [ ] Can add members to existing page
- [ ] Can remove members from page
- [ ] Member list updates correctly
- [ ] Members can access assigned pages

### Access Control
- [ ] Customers only see assigned pages
- [ ] Staff only see assigned pages
- [ ] Admin sees all pages
- [ ] Unauthorized access blocked

### Chat Functionality
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Message history loads
- [ ] Can upload files/images

### Page Conversion
- [ ] Can convert standard page to chat
- [ ] Conversion updates page type
- [ ] Chat features enabled after conversion

---

## 🐛 Troubleshooting

### Issue: Page not appearing in list
**Solution:**
- Check browser console for errors
- Check localStorage: `localStorage.getItem('localPages')`
- Try refreshing page
- Check if page was created successfully

### Issue: Members not being added
**Solution:**
- Verify email format is correct
- Check browser console for API errors
- Try adding member again
- Check if member exists in system

### Issue: Customer can't see assigned pages
**Solution:**
- Verify customer email is in page members
- Check customer is logged in correctly
- Verify page exists
- Check role permissions

### Issue: Chat not working
**Solution:**
- Check MQTT connection in console
- Verify page is chat-enabled
- Check browser console for errors
- Try refreshing page

### Issue: Real-time updates not working
**Solution:**
- Check MQTT service connection
- Verify MQTT broker is accessible
- Check network connectivity
- Check browser console for MQTT errors

---

## 📝 Test Data Examples

### Create Test Users:
1. **Admin User**
   - Email: `admin@test.com`
   - Role: Admin
   - Can create pages, assign members

2. **Staff User**
   - Email: `staff@test.com`
   - Role: Staff
   - Can be assigned to pages

3. **Customer Users**
   - Email: `customer1@test.com`
   - Email: `customer2@test.com`
   - Role: Customer
   - Can be assigned to pages

### Create Test Pages:
1. **Support Page**
   - Name: "Customer Support"
   - Members: `customer1@test.com`, `staff@test.com`
   - Type: Chat Page

2. **Sales Page**
   - Name: "Sales Team"
   - Members: `customer2@test.com`, `staff@test.com`
   - Type: Standard Page (convert to chat)

---

## 🎯 Quick Test Scenario

**Complete Workflow Test:**

1. **Admin creates page:**
   ```
   - Login as admin
   - Create page "Test Support"
   - Add members: customer1@test.com, staff@test.com
   - Save page
   ```

2. **Customer accesses page:**
   ```
   - Login as customer1@test.com
   - Go to dashboard
   - See "Test Support" page
   - Open page
   - Send message: "Hello, I need help"
   ```

3. **Staff responds:**
   ```
   - Login as staff@test.com
   - Go to dashboard
   - See "Test Support" page
   - Open page
   - See customer message
   - Respond: "How can I help you?"
   ```

4. **Verify real-time:**
   ```
   - Customer should see staff response immediately
   - Staff should see customer messages
   - Both can chat in real-time
   ```

---

## ✅ Success Criteria

The Pages System is working correctly if:

1. ✅ Admin/Staff can create pages
2. ✅ Members can be assigned to pages
3. ✅ Customers see only their assigned pages
4. ✅ Staff see only their assigned pages
5. ✅ Members can access assigned pages
6. ✅ Chat works on pages
7. ✅ Messages appear in real-time
8. ✅ Pages can be converted to chat pages
9. ✅ Member management works (add/remove)
10. ✅ Page list shows all pages correctly

---

## 🚀 Next Steps After Testing

If all tests pass:
- ✅ System is functional
- ✅ Ready for production use
- ✅ Can add more features

If tests fail:
- Check error messages in console
- Verify API endpoints are working
- Check localStorage for data
- Review network requests in DevTools

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify user roles and permissions
4. Check localStorage data
5. Review MQTT connection status
