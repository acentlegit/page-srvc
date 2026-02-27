# CRM Intake Form Requirements - Detailed Explanation

## Overview
The manager wants to implement a **CRM Intake Form/Page** that captures customer information, automatically converts it to PDF, and stores it in the system. This is for onboarding new customers into the system.

---

## Core Requirements

### 1. **CRM Intake Form/Page**

**Purpose**: A form page where new customers can submit their information to be added to the system.

**What to Capture**:
- First Name
- Last Name
- Middle Name (optional)
- Email ID
- Phone Number
- Location/Address
- Any other relevant information
- PDF file upload (optional)

**Two Types of Users**:

#### A. **Beam Users**
- Users who are part of the Beam system
- Get a **temporary user ID** or **permanent user ID** from the Beam system
- Admin/Agent can assign a user ID to them
- Can use their Beam user ID to log into the system
- Have access to Beam-specific features
- Managed through Beam's user management system

#### B. **Non-Beam Users**
- Regular customers/users who are NOT part of the Beam system
- Use their email ID to sign up
- System generates a **custom ID** for them
- Information stored in backend
- Can log in with email in the future
- Can be converted to Beam users later if needed

---

## Workflow - How Intake Form Will Work

### Step 1: Customer Submits Form
1. Customer visits the **CRM Intake Page**
2. Fills out the form with:
   - Personal information (name, email, phone, location)
   - Optionally uploads a PDF file
3. Clicks "Submit"

### Step 2: Automatic PDF Generation
1. System takes all the form data
2. **Automatically converts it to a PDF document**
3. PDF contains all the submitted information in a formatted way

### Step 3: Storage & Processing
1. PDF is **automatically uploaded to the backend/database**
2. PDF is **saved in the page** (associated with the page where form was submitted)
3. Information is **stored in CRM** (leads/accounts database)
4. **PDF parsing** will be done later by an agent (manual or automated)

### Step 4: User Creation
1. System creates a user account:
   - **Beam User**: Beam user ID assigned (temporary or permanent), managed through Beam system
   - **Non-Beam User**: Custom ID generated, email-based login
2. User is **added to the page** (as a member)
3. User can now access the page and participate

---

## Technical Implementation Details

### 1. **Intake Form Page**
- **Location**: `/customer/intake` or `/crm/intake`
- **Access**: Public (no login required) or Customer role
- **Components Needed**:
  - Form with fields: firstName, lastName, middleName, email, phone, location
  - File upload for PDF
  - Submit button
  - Location/GPS capture button

### 2. **PDF Generation**
- Use a library like `jsPDF` or `pdfkit` to generate PDF
- Format: Include all form fields in a structured PDF
- Include uploaded PDF as attachment if provided
- Generate PDF on form submission

### 3. **PDF Storage**
- Upload PDF to backend (if endpoint exists)
- Store PDF in localStorage (temporary) with page ID
- Associate PDF with the page: `pagePDFs_${pageId}`
- Store in CRM storage: `crmIntakeForms_${pageId}`

### 4. **User Creation**
- After form submission:
  - Create user via `usersApi.create()`
  - Add user to page members
  - Generate custom ID or temporary ID based on user type
  - Store in CRM as a lead/account

### 5. **Location/GPS Feature**
- Show current location on the page
- Button to capture GPS coordinates
- Display location on map (if available)
- Store location with form submission

---

## Integration Points

### 1. **Page = Event**
- Manager said: "Page is nothing but an event"
- Use the same endpoint as pages to create events
- Event contains pages, pages contain users
- Dynamic content structure

### 2. **People Management on Pages**
- Show all users on a page
- Filter users on a page
- Add people to pages
- Pop-up to add new people with form

### 3. **Media/Video Capture**
- **Important**: Use their API for media capture
- Don't use custom code
- They have their own software/API for this

---

## Data Flow Diagram

```
Customer → Intake Form → Submit
    ↓
Form Data Collected
    ↓
┌─────────────────┬─────────────────┐
│  Generate PDF   │  Upload PDF     │
│  (Automatic)    │  (if provided)   │
└─────────────────┴─────────────────┘
    ↓
Store PDF in Page
    ↓
Create User Account
    ↓
Add User to Page Members
    ↓
Store in CRM (Leads/Accounts)
    ↓
PDF Parsing (by Agent - later)
```

---

## Form Fields Structure

```typescript
interface IntakeFormData {
  // Personal Information
  firstName: string
  lastName: string
  middleName?: string
  email: string
  phone: string
  location?: {
    address?: string
    city?: string
    state?: string
    country?: string
    zip?: string
    gps?: {
      latitude: number
      longitude: number
    }
  }
  
  // User Type
  userType: 'beam' | 'non-beam'
  beamUserId?: string // For Beam users (temporary or permanent ID)
  customId?: string // For Non-Beam users (system generated)
  
  // Additional Information
  customFields?: Record<string, any>
  
  // Files
  uploadedPDF?: File
  generatedPDF?: string // Base64 or URL
  
  // Metadata
  pageId: string
  submittedAt: string
  submittedBy?: string
}
```

---

## Implementation Steps

### Phase 1: Create Intake Form Page
1. Create `IntakeFormPage.tsx`
2. Add form fields (name, email, phone, location)
3. Add PDF upload functionality
4. Add GPS location capture
5. Add submit handler

### Phase 2: PDF Generation
1. Install PDF library (`jspdf` or similar)
2. Create PDF generation function
3. Format form data into PDF
4. Include uploaded PDF if provided

### Phase 3: Backend Integration
1. Create API endpoint for intake form submission
2. Store PDF in page storage
3. Create user account
4. Add user to page members
5. Store in CRM

### Phase 4: User Type Handling
1. Add user type selection (Beam User / Non-Beam User)
2. For Beam Users: Assign/get Beam user ID (temporary or permanent)
3. For Non-Beam Users: Generate custom ID, email-based login
4. Handle login for both types
5. Allow conversion from Non-Beam to Beam user later

### Phase 5: Location Features
1. Add GPS capture button
2. Show location on map
3. Store location with form

---

## Key Points from Manager's Conversation

1. **"Page is nothing but an event"** → Use page endpoints for events
2. **"Use their API for media/video"** → Don't use custom code, use their API
3. **"PDF parsing by agent"** → PDF parsing is manual/automated later, not in this form
4. **"Save PDF in the page"** → Associate PDF with the page where form was submitted
5. **"Two types of users"** → B2C (email-based) and B2B (temporary ID)
6. **"Location/GPS"** → Show location, allow GPS capture
7. **"Filter people on page"** → Show all users, allow filtering

---

## Questions to Clarify

1. **Where should the intake form be accessible?**
   - Public URL (no login)?
   - Customer dashboard?
   - Specific page?

2. **PDF Format**:
   - What template/layout for the PDF?
   - Include logo/header?
   - Specific fields order?

3. **User Type Selection**:
   - Customer selects Beam User / Non-Beam User?
   - Or admin assigns after submission?

4. **Beam User ID**:
   - How to get/assign Beam user ID?
   - Temporary vs Permanent ID?
   - Format/pattern?
   - Integration with Beam user management system?

5. **Non-Beam User Custom ID**:
   - Format/pattern for custom ID?
   - Auto-generated or manual?

6. **Location**:
   - Required field?
   - Auto-capture on page load?
   - Manual entry or GPS only?

---

## Summary

**What We Need to Build**:
1. ✅ **Intake Form Page** - Capture customer information
2. ✅ **PDF Generation** - Auto-convert form to PDF
3. ✅ **PDF Storage** - Save PDF in page and backend
4. ✅ **User Creation** - Create B2C/B2B users
5. ✅ **Location Capture** - GPS and location fields
6. ✅ **Page Integration** - Add users to pages
7. ✅ **CRM Storage** - Store in leads/accounts

**What We Already Have**:
- ✅ Page management
- ✅ User management
- ✅ Chat functionality
- ✅ File upload
- ✅ CRM structure (leads, opportunities, accounts)

**What We Need to Add**:
- ⚠️ Intake form page
- ⚠️ PDF generation library
- ⚠️ PDF upload/storage
- ⚠️ User type handling (Beam User / Non-Beam User)
- ⚠️ Beam user ID assignment/integration
- ⚠️ Custom ID generation for Non-Beam users
- ⚠️ Location/GPS capture
- ⚠️ Automatic PDF conversion

---

This is a comprehensive intake system that captures customer information, converts it to PDF, and integrates with your existing CRM and page management system.
