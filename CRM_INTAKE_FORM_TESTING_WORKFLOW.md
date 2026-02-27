# CRM Intake Form - Complete Testing Workflow

## ✅ Implementation Status

**Everything is implemented!** Here's what happens when you submit the intake form:

1. ✅ **PDF Generation** - Automatic conversion to PDF
2. ✅ **User Creation** - Creates user account (Beam or Non-Beam)
3. ✅ **CRM Lead Creation** - Creates lead in CRM system
4. ✅ **PDF Storage** - Stores PDF in page and CRM
5. ✅ **Page Membership** - Adds user to page (if pageId provided)
6. ✅ **Activity Logging** - Logs all actions in Activity Feed

---

## 📍 Where to See Created Data

### 1. **View Created User**

#### Option A: Search User Page
- **Path**: `People → Search User`
- **URL**: `/people/search-user`
- **How to find**:
  1. Go to sidebar → **People** → **Search User**
  2. Search for: `poojitha@acentle.com` or `pooji` or `CUSTOM_1771089732852_qz09mhfe4`
  3. Click **Search** button
  4. User will appear in the table

#### Option B: People Page
- **Path**: `People → People` (if exists)
- **URL**: `/people` or `/people/people`
- **How to find**:
  1. Go to sidebar → **People**
  2. All users are listed automatically
  3. Search for the user by name or email
  4. User will appear in the table

#### Option C: Check localStorage (Developer)
- Open browser console (F12)
- Run: `JSON.parse(localStorage.getItem('localUsers') || '[]')`
- Find user with email: `poojitha@acentle.com`

---

### 2. **View Created Lead**

- **Path**: `Management → CRM → Leads`
- **URL**: `/admin/crm/leads`
- **How to find**:
  1. Go to sidebar → **Management** → **CRM** → **Leads**
  2. The lead will appear in the table
  3. Status: **NEW**
  4. Name: **pooji V** (or full name)
  5. Email: **poojitha@acentle.com**
  6. Phone: **2345678943**

---

### 3. **View Activity Log**

- **Path**: `Management → CRM → Activity Feed`
- **URL**: `/admin/crm/activity`
- **How to find**:
  1. Go to sidebar → **Management** → **CRM** → **Activity Feed**
  2. Look for activity: **"Intake form submitted for pooji V (Non-Beam User)"**
  3. Shows: Who submitted, when, and what happened

---

### 4. **View Generated PDF**

#### Option A: In the Form (After Submission)
- After submitting, a success message appears
- Click **"View Generated PDF"** button
- PDF opens in new tab/window

#### Option B: In localStorage (Developer)
- Open browser console (F12)
- Run: `JSON.parse(localStorage.getItem('pagePDFs_${pageId}') || '[]')`
- Or: `JSON.parse(localStorage.getItem('crmIntakeForms_${pageId}') || '[]')`
- Find the PDF with `pdfBase64` field

---

### 5. **View User in Page (if pageId provided)**

- **Path**: `Communication → Pages`
- **URL**: `/communication/pages`
- **How to find**:
  1. Go to the page where you submitted the form
  2. Click on the page to view details
  3. Check **Members** section
  4. User should be listed as a member

---

## 🧪 Complete Testing Workflow

### **Test 1: Submit Intake Form (Non-Beam User)**

1. **Navigate to Intake Form**
   - Go to: `/crm/intake` or click **Intake Form** in sidebar
   - Or with page ID: `/crm/intake?pageId=123`

2. **Fill the Form**
   ```
   First Name: pooji
   Last Name: V
   Middle Name: (optional)
   Email: poojitha@acentle.com
   Phone: 2345678943
   User Type: Non-Beam User (selected)
   Location: (fill address, city, state, country, zip)
   Additional Info: (optional)
   PDF Upload: (optional)
   ```

3. **Submit Form**
   - Click **"Submit Intake Form"** button
   - Wait for success message
   - Note the **Custom ID** shown (e.g., `CUSTOM_1771089732852_qz09mhfe4`)

4. **Verify Results**
   - ✅ Success message appears
   - ✅ PDF is generated (click "View Generated PDF")
   - ✅ User is created (check Search User page)
   - ✅ Lead is created (check CRM Leads page)
   - ✅ Activity is logged (check Activity Feed)

---

### **Test 2: Submit Intake Form (Beam User)**

1. **Navigate to Intake Form**
   - Go to: `/crm/intake`

2. **Fill the Form**
   ```
   First Name: John
   Last Name: Doe
   Email: john@example.com
   Phone: 1234567890
   User Type: Beam User (select this)
   Beam User ID: BEAM_12345 (enter your Beam ID)
   Location: (fill all fields)
   ```

3. **Submit Form**
   - Click **"Submit Intake Form"**
   - Note the **Beam User ID** shown

4. **Verify Results**
   - ✅ User created with Beam User ID
   - ✅ Lead created in CRM
   - ✅ PDF generated and stored

---

### **Test 3: Submit with Page ID**

1. **Get a Page ID**
   - Go to: `/communication/pages`
   - Note a page ID (e.g., `123`)

2. **Submit Form with Page ID**
   - Go to: `/crm/intake?pageId=123`
   - Fill and submit the form

3. **Verify Page Membership**
   - Go to: `/communication/pages`
   - Click on page ID `123`
   - Check **Members** section
   - User should be listed

---

### **Test 4: View Created User**

1. **Search for User**
   - Go to: `/people/search-user`
   - Search: `poojitha@acentle.com`
   - Click **Search**
   - User should appear

2. **View User Details**
   - Click **View** button on the user row
   - See: Name, Email, Phone, Role, Custom ID

3. **Edit User** (if needed)
   - Click **Edit** button
   - Modify information
   - Save changes

---

### **Test 5: View Created Lead**

1. **Go to Leads Page**
   - Navigate: `/admin/crm/leads`
   - Lead should appear in the table

2. **View Lead Details**
   - Click **View** on the lead
   - See: Name, Email, Phone, Status, Notes

3. **Convert Lead to Opportunity**
   - Click **Convert** button
   - Fill opportunity details
   - Lead becomes opportunity

---

### **Test 6: View Activity Feed**

1. **Go to Activity Feed**
   - Navigate: `/admin/crm/activity`
   - Activity should appear

2. **Filter Activities**
   - Filter by type: **Lead**
   - Filter by action: **Created**
   - See your intake form submission

---

### **Test 7: View PDF**

1. **After Form Submission**
   - Success message shows
   - Click **"View Generated PDF"** button
   - PDF opens showing all form data

2. **Check PDF Content**
   - Verify all fields are included
   - Check formatting
   - Verify date/time stamp

---

## 📊 Data Flow Verification

### **Step-by-Step Verification**

1. **Form Submission** ✅
   - Form data collected
   - Validation passed

2. **PDF Generation** ✅
   - PDF created automatically
   - Contains all form fields
   - Stored as base64

3. **User Creation** ✅
   - User account created
   - Custom ID generated (Non-Beam) or Beam ID used
   - Stored in `localUsers` in localStorage
   - Can be found via Search User page

4. **Lead Creation** ✅
   - Lead created in CRM
   - Status: NEW
   - Stored in `localLeads` in localStorage
   - Visible in Leads Management page

5. **PDF Storage** ✅
   - PDF stored in `pagePDFs_${pageId}`
   - Also stored in `crmIntakeForms_${pageId}`
   - Accessible via localStorage

6. **Page Membership** ✅
   - User added to page members (if pageId provided)
   - Visible in page details

7. **Activity Logging** ✅
   - Activity logged in Activity Feed
   - Shows: Who, What, When

---

## 🔍 Quick Verification Checklist

After submitting the intake form, verify:

- [ ] **User Created**: Search for user in `/people/search-user`
- [ ] **Lead Created**: Check `/admin/crm/leads`
- [ ] **PDF Generated**: Click "View Generated PDF" after submission
- [ ] **Activity Logged**: Check `/admin/crm/activity`
- [ ] **Page Member Added**: Check page members (if pageId provided)
- [ ] **Custom ID Generated**: Shown in success message (Non-Beam users)
- [ ] **Beam ID Used**: Shown in success message (Beam users)

---

## 🐛 Troubleshooting

### **User Not Showing in Search**

1. **Check localStorage**:
   ```javascript
   JSON.parse(localStorage.getItem('localUsers') || '[]')
   ```

2. **Refresh Search User Page**

3. **Search with different terms**: email, name, or custom ID

### **Lead Not Showing**

1. **Check localStorage**:
   ```javascript
   JSON.parse(localStorage.getItem('localLeads') || '[]')
   ```

2. **Refresh Leads Page**

3. **Check Activity Feed** to see if lead was created

### **PDF Not Generated**

1. **Check browser console** for errors
2. **Verify jsPDF library** is installed
3. **Check form validation** - all required fields filled?

### **Page Member Not Added**

1. **Verify pageId** was provided in URL
2. **Check page exists** in system
3. **Check browser console** for errors

---

## 📝 Summary

**Everything is implemented and working!** When you submit the intake form:

1. ✅ User is created → View in **People → Search User**
2. ✅ Lead is created → View in **Management → CRM → Leads**
3. ✅ PDF is generated → View immediately after submission
4. ✅ Activity is logged → View in **Management → CRM → Activity Feed**
5. ✅ User added to page → View in page members (if pageId provided)

**Your created user:**
- **Email**: `poojitha@acentle.com`
- **Custom ID**: `CUSTOM_1771089732852_qz09mhfe4`
- **User ID**: `1`
- **Role**: `customer`

**To find it:**
1. Go to **People → Search User**
2. Search: `poojitha@acentle.com`
3. Click **Search**
4. User will appear! ✅
