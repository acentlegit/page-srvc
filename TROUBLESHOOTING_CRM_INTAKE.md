# Troubleshooting: Cannot See Leads, Activities, or PDF

## 🔍 Quick Debugging Steps

### Step 1: Check Browser Console
1. Open browser console (F12)
2. Look for these logs after submitting intake form:
   - `✅ Lead created:` - Should show lead data
   - `✅ Activity logged:` - Should show activity data
   - `✅ PDF generated:` - Should show "Yes"
   - `✅ User created with ID:` - Should show user ID

### Step 2: Check localStorage Directly

Open browser console (F12) and run these commands:

#### Check Leads:
```javascript
JSON.parse(localStorage.getItem('localLeads') || '[]')
```
**Expected**: Array with your lead (name: "pooji V", email: "poojitha@acentle.com")

#### Check Activities:
```javascript
JSON.parse(localStorage.getItem('crmActivities') || '[]')
```
**Expected**: Array with activity showing "Intake form submitted for pooji V"

#### Check Users:
```javascript
JSON.parse(localStorage.getItem('localUsers') || '[]')
```
**Expected**: Array with user (email: "poojitha@acentle.com")

---

## 🛠️ Solutions

### Problem 1: Leads Not Showing

**Solution A: Refresh the Page**
1. Go to: `/admin/crm/leads`
2. Click **"Refresh"** button (top right)
3. Leads should appear

**Solution B: Check Status Filter**
1. Make sure status filter is set to **"ALL"** or **"NEW"**
2. Your lead has status: **NEW**

**Solution C: Check Search Query**
1. Clear the search box
2. Make sure no search filter is active

**Solution D: Manual Check**
1. Open browser console (F12)
2. Run: `JSON.parse(localStorage.getItem('localLeads') || '[]')`
3. If you see your lead, the page needs refresh
4. Click **Refresh** button on Leads page

---

### Problem 2: Activities Not Showing

**Solution A: Refresh the Page**
1. Go to: `/admin/crm/activity`
2. Click **"Refresh"** button (top right)
3. Activities should appear

**Solution B: Check Filters**
1. Make sure **Type** filter is set to **"All Types"** or **"Leads"**
2. Make sure **Action** filter is set to **"All Actions"** or **"Created"**

**Solution C: Manual Check**
1. Open browser console (F12)
2. Run: `JSON.parse(localStorage.getItem('crmActivities') || '[]')`
3. If you see activities, the page needs refresh
4. Click **Refresh** button on Activity Feed page

---

### Problem 3: PDF View Button Not Showing

**Solution A: Check After Submission**
1. Submit the intake form
2. Look for success message
3. **"View Generated PDF"** button appears in the success alert
4. Click the button to open PDF

**Solution B: Check PDF Generation**
1. Open browser console (F12)
2. After submission, look for: `✅ PDF generated: Yes`
3. If it says "No", PDF generation failed

**Solution C: Manual PDF Access**
1. Open browser console (F12)
2. Run: `JSON.parse(localStorage.getItem('pagePDFs_${pageId}') || '[]')`
3. Or: `JSON.parse(localStorage.getItem('crmIntakeForms_${pageId}') || '[]')`
4. Find the PDF with `pdfBase64` field
5. Copy the base64 string
6. Create a data URL: `data:application/pdf;base64,${base64String}`
7. Open in new tab

---

## 📋 Complete Testing Checklist

After submitting intake form:

### ✅ Step 1: Verify Data Creation
Open browser console (F12) and check:

```javascript
// Check leads
const leads = JSON.parse(localStorage.getItem('localLeads') || '[]')
console.log('Leads:', leads)
console.log('Lead count:', leads.length)

// Check activities
const activities = JSON.parse(localStorage.getItem('crmActivities') || '[]')
console.log('Activities:', activities)
console.log('Activity count:', activities.length)

// Check users
const users = JSON.parse(localStorage.getItem('localUsers') || '[]')
console.log('Users:', users)
console.log('User count:', users.length)
```

**Expected Results:**
- ✅ Leads array has at least 1 lead
- ✅ Activities array has at least 1 activity
- ✅ Users array has at least 1 user

---

### ✅ Step 2: View Leads Page
1. Navigate to: **Management → CRM → Leads** (`/admin/crm/leads`)
2. Click **"Refresh"** button (top right)
3. Check console for: `📋 Fetched leads: X` (should be > 0)
4. Lead should appear in table

**If not showing:**
- Check status filter (set to "ALL")
- Clear search box
- Click Refresh button again

---

### ✅ Step 3: View Activity Feed
1. Navigate to: **Management → CRM → Activity Feed** (`/admin/crm/activity`)
2. Click **"Refresh"** button (top right)
3. Check console for: `📊 Loaded activities: X` (should be > 0)
4. Activity should appear in timeline

**If not showing:**
- Check Type filter (set to "All Types")
- Check Action filter (set to "All Actions")
- Click Refresh button again

---

### ✅ Step 4: View PDF
1. After submitting form, look for success message
2. Success message should show: **"PDF generated successfully!"**
3. Click **"View Generated PDF"** button
4. PDF opens in new tab

**If button not showing:**
- Check if `generatedPdfUrl` is set (console log)
- Check browser console for PDF generation errors
- Try refreshing the form page

---

## 🐛 Common Issues

### Issue 1: Data Created But Not Visible

**Cause**: Page not refreshing after data creation

**Solution**:
1. Click **Refresh** button on the page
2. Or refresh the browser page (F5)
3. Data should appear

---

### Issue 2: localStorage Empty

**Cause**: Data not being saved

**Solution**:
1. Check browser console for errors
2. Make sure localStorage is enabled
3. Try submitting form again
4. Check console logs: `✅ Lead created:`, `✅ Activity logged:`

---

### Issue 3: PDF Not Generating

**Cause**: jsPDF library issue or form validation error

**Solution**:
1. Check browser console for errors
2. Make sure all required fields are filled
3. Check if jsPDF is installed: `npm list jspdf`
4. Try submitting form again

---

## 🔧 Manual Data Verification

### Check All Data at Once:

Open browser console (F12) and run:

```javascript
// Check everything
console.log('=== CRM DATA CHECK ===')
console.log('Leads:', JSON.parse(localStorage.getItem('localLeads') || '[]'))
console.log('Activities:', JSON.parse(localStorage.getItem('crmActivities') || '[]'))
console.log('Users:', JSON.parse(localStorage.getItem('localUsers') || '[]'))

// Check for your specific lead
const leads = JSON.parse(localStorage.getItem('localLeads') || '[]')
const yourLead = leads.find(l => l.email === 'poojitha@acentle.com')
console.log('Your Lead:', yourLead)

// Check for your activity
const activities = JSON.parse(localStorage.getItem('crmActivities') || '[]')
const yourActivity = activities.find(a => a.entityName && a.entityName.includes('pooji'))
console.log('Your Activity:', yourActivity)
```

---

## ✅ Expected Results After Form Submission

1. **Console Logs:**
   - `✅ Lead created: {id: "...", name: "pooji V", ...}`
   - `✅ Activity logged: {id: "...", description: "..."}`
   - `✅ PDF generated: Yes`
   - `✅ User created with ID: 1`

2. **localStorage:**
   - `localLeads`: Array with 1+ leads
   - `crmActivities`: Array with 1+ activities
   - `localUsers`: Array with 1+ users

3. **Pages:**
   - **Leads Page**: Shows your lead in table
   - **Activity Feed**: Shows your activity in timeline
   - **Intake Form**: Shows "View Generated PDF" button

---

## 🚀 Quick Fix Commands

If data exists but not showing, run in console:

```javascript
// Force refresh leads page
window.location.reload()

// Or manually trigger data load
localStorage.setItem('forceRefresh', Date.now().toString())
```

Then refresh the page.

---

## 📞 Still Not Working?

1. **Check browser console** for any errors
2. **Check Network tab** for failed API calls
3. **Clear browser cache** and try again
4. **Check localStorage** directly (commands above)
5. **Submit form again** and check console logs

The data IS being created - you just need to refresh the pages to see it!
