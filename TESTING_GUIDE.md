# 🧪 Complete Testing Guide

## ✅ Prerequisites

- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://localhost:5174
- ✅ MongoDB connected to Atlas
- ✅ Logged into admin account

## 🎯 Test Scenario 1: Create Your First Intake Form

### Step 1: Navigate to Form Builder
1. Open http://localhost:5174
2. Login if needed
3. Click **"Custom Applications"** in left sidebar
4. Click **"Citizen Services #1"**
5. Click **"Intake Form Builder"**

### Step 2: Upload a Template
1. Click **"Choose File"** button
2. Select a file:
   - **Excel**: Any `.xlsx` or `.xls` file (even a simple one with headers)
   - **Word**: Any `.docx` or `.doc` file
   - **PDF**: Any `.pdf` file
3. Wait for file to upload and parse

### Step 3: Review Extracted Fields
- You should see a table showing:
  - Field Name
  - Label
  - Type (Text, Email, Date, etc.)
  - Required status

### Step 4: Generate Form
1. Enter a form name (e.g., "Citizen Services Intake Form")
2. Click **"Generate Form"**
3. You should see: "Form generated successfully!"

### Step 5: Verify Form Created
1. Click **"Intake Forms"** in the menu
2. You should see your newly created form in the list!

---

## 🎯 Test Scenario 2: Submit an Intake Form

### Step 1: Access the Intake Form
1. Go to **"Intake Forms"**
2. Click on a form (or create one first)
3. You'll see the comprehensive intake form

### Step 2: Fill Out the Form

**Section 1: Consent & Privacy**
- ✅ Check both consent boxes
- Click **"Next"**

**Section 2: Basic Information**
- Fill in:
  - Full Legal Name
  - Date of Birth
  - Phone Number
  - Email Address
  - Address, City, State, ZIP
- Click **"Next"**

**Section 3: Household Information**
- Enter:
  - Household Size
  - Number of Children
  - Number of Seniors
  - Select disability status
  - Select income range
- Click **"Next"**

**Section 4: Current Situation**
- Select any applicable situations (checkboxes)
- Click **"Next"**

**Section 5: Service Request**
- Select services needed (multi-select)
- Click **"Next"**

**Section 6: Additional Services**
- Select programs (camping, sports, etc.)
- Click **"Next"**

**Section 7: Urgency Level**
- Select urgency (Emergency, High, or Standard)
- Click **"Next"**

**Section 8: Documentation** (Optional)
- Upload files if needed
- Click **"Next"**

**Section 9: Additional Notes**
- Add any notes
- Click **"Submit Form"**

### Step 3: Verify Submission
1. You should see: "Intake form submitted successfully!"
2. Data is now saved in MongoDB!

---

## 🎯 Test Scenario 3: View Analytics

### Step 1: Go to Analytics
1. Click **"Analytics Dashboard"**
2. You should see:
   - Overview cards (Total Intakes, Active Programs, etc.)
   - Charts showing:
     - Intakes by Service Type (Pie Chart)
     - Program Sign-ups (Bar Chart)
     - Demographics (if data available)

### Step 2: Check Statistics
- Total Intakes should show the number of submissions
- Active Programs shows programs you've created
- Charts update as you add more data

---

## 🎯 Test Scenario 4: Create and Manage Programs

### Step 1: Test Program API
You can test this via API or add it to frontend later:

**Using Browser Console or Postman:**
```javascript
// Create a program
fetch('http://localhost:3000/api/custom-applications/citizen-services/programs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Summer Camps',
    description: 'Summer camp program for children'
  })
})
.then(r => r.json())
.then(data => console.log('Program created:', data));
```

### Step 2: List Programs
```javascript
fetch('http://localhost:3000/api/custom-applications/citizen-services/programs')
.then(r => r.json())
.then(data => console.log('Programs:', data));
```

---

## 🎯 Test Scenario 5: File Upload & Parsing

### Test with Different File Types

**Excel File:**
1. Create a simple Excel file with headers:
   - Column A: "Full Name"
   - Column B: "Email"
   - Column C: "Phone"
   - Column D: "Date of Birth"
2. Upload it
3. Check if fields are extracted correctly

**Word Document:**
1. Create a Word doc with:
   - "Full Name:"
   - "Email:"
   - "Phone:"
2. Upload it
3. Check field extraction

**PDF File:**
1. Upload any PDF
2. Check if text is extracted and fields are created

---

## 🔍 Verification Checklist

After testing, verify:

- [ ] Form Builder uploads and parses files
- [ ] Forms are generated and saved
- [ ] Forms appear in the list
- [ ] Intake form can be filled out completely
- [ ] Form submission saves to MongoDB
- [ ] Analytics dashboard shows data
- [ ] No console errors in browser
- [ ] No errors in backend logs

---

## 🐛 Common Issues & Solutions

### Issue: File upload fails
**Solution:** Check file size (max 10MB) and file type

### Issue: Fields not extracted
**Solution:** Make sure file has clear headers or field labels

### Issue: Form not appearing in list
**Solution:** Refresh the page, check backend logs

### Issue: Submission fails
**Solution:** Check all required fields are filled, check backend logs

---

## 📊 Expected Results

### After Creating a Form:
- Form appears in "Intake Forms" list
- Can view form details
- Can edit/delete form

### After Submitting Intake:
- Success message appears
- Data saved to MongoDB
- Can view in Analytics
- Citizen data synced to Beam (if configured)

### Analytics Dashboard:
- Shows real-time statistics
- Charts update with new data
- Demographics breakdown available

---

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ Can upload templates and generate forms
2. ✅ Forms appear in the list
3. ✅ Can fill out and submit intake forms
4. ✅ Data appears in Analytics
5. ✅ No errors in browser console
6. ✅ No errors in backend logs

**Start with Test Scenario 1 and work through them!**
