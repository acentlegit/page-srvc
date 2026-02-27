# Quick Fix: Cannot See Leads and Activities

## 🔍 Immediate Steps to See Your Data

### Step 1: Check if Data Exists

Open browser console (F12) and run:

```javascript
// Check leads
const leads = JSON.parse(localStorage.getItem('localLeads') || '[]')
console.log('Leads:', leads)
console.log('Lead count:', leads.length)

// Check activities
const activities = JSON.parse(localStorage.getItem('crmActivities') || '[]')
console.log('Activities:', activities)
console.log('Activity count:', activities.length)
```

**If you see data here**, the pages just need to refresh.

---

### Step 2: Force Refresh Pages

#### For Leads Page:
1. Go to: **Management → CRM → Leads** (`/admin/crm/leads`)
2. Open browser console (F12)
3. Run: `window.location.reload()`
4. Or click the **"Refresh"** button (top right)
5. Check console for: `📋 Fetched leads: X` (should be > 0)

#### For Activity Feed:
1. Go to: **Management → CRM → Activity Feed** (`/admin/crm/activity`)
2. Open browser console (F12)
3. Run: `window.location.reload()`
4. Or click the **"Refresh"** button (top right)
5. Check console for: `📊 Loaded activities: X` (should be > 0)

---

### Step 3: Clear Filters

#### On Leads Page:
1. Make sure **Status** filter is set to **"All Status"**
2. Clear the **Search** box (make sure it's empty)
3. Click **Refresh** button

#### On Activity Feed:
1. Make sure **Type** filter is set to **"All Types"**
2. Make sure **Action** filter is set to **"All Actions"**
3. Click **Refresh** button

---

### Step 4: Manual Data Check

If still not showing, run this in console:

```javascript
// Force check and display
const leads = JSON.parse(localStorage.getItem('localLeads') || '[]')
const activities = JSON.parse(localStorage.getItem('crmActivities') || '[]')

console.log('=== DATA CHECK ===')
console.log('Leads found:', leads.length)
leads.forEach((lead, i) => {
  console.log(`Lead ${i + 1}:`, lead.name, lead.email, lead.id)
})

console.log('Activities found:', activities.length)
activities.forEach((act, i) => {
  console.log(`Activity ${i + 1}:`, act.description, act.timestamp)
})
```

**If you see your data here but not on the page**, there's a display issue.

---

## 🛠️ If Data Doesn't Exist

### Re-submit the Intake Form

1. Go to: **Intake Form** (`/crm/intake`)
2. Fill the form again
3. Submit
4. Check console for:
   - `✅ Lead created:`
   - `✅ Activity logged:`
   - `✅ PDF generated: Yes`

5. Then go back to Leads and Activity Feed pages
6. Click **Refresh** buttons

---

## 🐛 Debugging Commands

Run these in browser console (F12):

### Check All CRM Data:
```javascript
console.log('=== FULL CRM DATA CHECK ===')
console.log('Leads:', JSON.parse(localStorage.getItem('localLeads') || '[]'))
console.log('Activities:', JSON.parse(localStorage.getItem('crmActivities') || '[]'))
console.log('Users:', JSON.parse(localStorage.getItem('localUsers') || '[]'))
```

### Find Your Specific Lead:
```javascript
const leads = JSON.parse(localStorage.getItem('localLeads') || '[]')
const yourLead = leads.find(l => l.email === 'poojitha@acentle.com' || l.name?.includes('pooji'))
console.log('Your Lead:', yourLead)
```

### Find Your Activity:
```javascript
const activities = JSON.parse(localStorage.getItem('crmActivities') || '[]')
const yourActivity = activities.find(a => 
  a.entityName?.includes('pooji') || 
  a.description?.includes('Intake form')
)
console.log('Your Activity:', yourActivity)
```

---

## ✅ Expected Console Output

After submitting intake form, you should see:

```
✅ Lead created: {id: "lead_...", name: "pooji V", email: "poojitha@acentle.com", ...}
✅ Activity logged: {id: "activity_...", description: "Created pooji V", ...}
✅ PDF generated: Yes
✅ User created with ID: 1
✅ Total leads in localStorage: 1
```

When you go to Leads page and click Refresh:

```
📋 Fetched leads: 1
📋 Leads data: [{id: "lead_...", name: "pooji V", ...}]
📋 localStorage leads: 1 [{...}]
📋 Merged leads: 1
📋 Mapped rows: 1
```

When you go to Activity Feed and click Refresh:

```
📊 Loaded activities: 1
📊 Activities data: [{id: "activity_...", description: "Created pooji V", ...}]
📊 localStorage activities: 1 [{...}]
📊 Filtered activities: 1
```

---

## 🚀 Quick Test

1. **Submit intake form** with email: `test@example.com`
2. **Check console** - should see `✅ Lead created:`
3. **Go to Leads page** - click **Refresh**
4. **Check console** - should see `📋 Fetched leads: 1`
5. **Lead should appear** in table

If step 4 shows `📋 Fetched leads: 0` but console shows data exists, there's a reading issue.

---

## 💡 Most Common Issue

**Data exists but page not refreshing:**

1. Click **Refresh** button on the page
2. Or refresh browser (F5)
3. Or clear filters (set to "ALL")
4. Data should appear

The data IS being created - you just need to refresh the pages to see it!
