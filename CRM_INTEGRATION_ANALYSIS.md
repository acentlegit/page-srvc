# CRM Module Integration Analysis

## 📁 What's in the Folder

The `brd_platform_with_crm` folder contains a **Customer Relationship Management (CRM)** module with the following structure:

```
brd_platform_with_crm/
├── apps/
│   ├── api/                    # Backend Express.js API
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js        # Main Express server (port 4000)
│   │       └── modules/
│   │           └── crm/
│   │               └── crm.routes.js  # CRM API routes
│   └── web/                    # Frontend React app (example)
│       ├── package.json
│       └── src/
│           └── App.js          # Basic React CRM dashboard
```

---

## 🎯 Features Included

### 1. **Lead Management**
   - **Create Lead**: POST `/crm/leads`
     - Creates a new lead with name, email, and auto-assigned "NEW" status
   - **List Leads**: GET `/crm/leads`
     - Retrieves all leads

### 2. **Lead Conversion**
   - **Convert Lead to Opportunity**: POST `/crm/leads/:id/convert`
     - Converts a lead into an Account + Opportunity
     - Creates an Account automatically
     - Creates an Opportunity with stage "PROSPECT"
     - Updates lead status to "CONVERTED"

### 3. **Opportunity Management**
   - **List Opportunities**: GET `/crm/opportunities`
     - Retrieves all opportunities with their stages and values

### 4. **Account Management**
   - Accounts are created automatically when converting leads
   - Stored in-memory (would need database in production)

---

## 🔧 Technical Stack

### Backend (API)
- **Framework**: Express.js
- **Port**: 4000
- **Dependencies**:
  - `express` - Web framework
  - `cors` - Cross-origin resource sharing
  - `dotenv` - Environment variables
  - `jsonwebtoken` - JWT authentication (available but not used in routes)
  - `uuid` - Unique ID generation
- **Storage**: In-memory arrays (temporary, needs database)

### Frontend (Example)
- **Framework**: React 18
- **HTTP Client**: Axios
- **Basic UI**: Simple button and list display

---

## 📍 Where to Implement in Your Application

### 1. **Backend API Integration**

#### Option A: Integrate into Existing Staging Backend
Since your app uses a staging backend (`cudb-root-api.staging.beamdev.hu`), you would need to:
- Add CRM endpoints to your Swagger backend
- Endpoints would be: `/createLead`, `/searchLead`, `/convertLead`, `/searchOpportunity`, etc.

#### Option B: Create Local Backend Module
If you want to add a local backend:
- **Location**: Create `backend/src/modules/crm/` (if you have a backend folder)
- **Routes**: Integrate `crm.routes.js` into your existing Express server
- **Port**: Either use port 4000 or integrate into your existing API server

#### Option C: Add to Frontend API Client (Current Approach)
Since your app currently uses frontend API calls directly to staging backend:
- **Location**: `frontend/src/api/crm.ts`
- **Pattern**: Similar to `frontend/src/api/pages.ts`, `frontend/src/api/users.ts`
- **Integration**: Add CRM API methods to `apiClient.ts`

### 2. **Frontend Pages**

#### Create New CRM Pages:
1. **Leads Management Page**
   - **Location**: `frontend/src/pages/LeadsManagementPage.tsx`
   - **Route**: `/admin/crm/leads` or `/management/leads`
   - **Features**:
     - List all leads in a table
     - Create new lead form
     - Convert lead to opportunity button
     - Filter by status (NEW, CONVERTED)

2. **Opportunities Page**
   - **Location**: `frontend/src/pages/OpportunitiesPage.tsx`
   - **Route**: `/admin/crm/opportunities`
   - **Features**:
     - List all opportunities
     - Show opportunity value, stage, account
     - Update opportunity stage

3. **Accounts Page** (Optional)
   - **Location**: `frontend/src/pages/AccountsPage.tsx`
   - **Route**: `/admin/crm/accounts`
   - **Features**:
     - List all accounts
     - View account details

### 3. **Sidebar Navigation**

Add CRM section to admin sidebar:
- **Location**: `frontend/src/layout/sidebarData.ts`
- **Add to Management section**:
```typescript
{
  label: 'Management',
  children: [
    { label: 'Tasks', path: '/admin/tasks' },
    { label: 'CRM', path: '/admin/crm' },
    { label: 'Leads', path: '/admin/crm/leads' },
    { label: 'Opportunities', path: '/admin/crm/opportunities' },
  ],
}
```

### 4. **API Client Integration**

Add CRM endpoints to your API client:
- **Location**: `frontend/src/api/apiClient.ts`
- **Add endpoints**:
  - `VITE_API_ENDPOINT_CREATE_LEAD=/createLead`
  - `VITE_API_ENDPOINT_SEARCH_LEAD=/searchLead`
  - `VITE_API_ENDPOINT_CONVERT_LEAD=/convertLead`
  - `VITE_API_ENDPOINT_SEARCH_OPPORTUNITY=/searchOpportunity`

### 5. **Routes in App.tsx**

Add protected routes:
- **Location**: `frontend/src/App.tsx`
- **Add routes**:
```typescript
<Route
  path="/admin/crm/leads"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <LeadsManagementPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
```

---

## 🔄 Integration Steps

### Step 1: Create CRM API Module
1. Create `frontend/src/api/crm.ts` with interfaces and API methods
2. Follow the pattern of `frontend/src/api/pages.ts` or `frontend/src/api/users.ts`
3. Use your existing `apiCall` function from `apiClient.ts`

### Step 2: Create CRM Pages
1. Create `LeadsManagementPage.tsx` with:
   - Table showing leads (using `AdminTable` component if available)
   - Form to create new leads
   - Convert button for each lead
2. Create `OpportunitiesPage.tsx` with:
   - Table showing opportunities
   - Stage indicators (chips/badges)
   - Value display

### Step 3: Add to Navigation
1. Update `sidebarData.ts` to include CRM menu items
2. Add routes in `App.tsx`

### Step 4: Connect to Backend
- If using staging backend: Add CRM endpoints to Swagger backend
- If using local backend: Integrate `crm.routes.js` into your Express server
- Update API client to use correct endpoints

---

## 🎨 UI Components to Use

Based on your existing codebase, use:
- **Material-UI** components (already in use)
- **AdminTable** component (if available) for data tables
- **Chips** for status indicators (like in TasksManagementPage)
- **Dialogs** for forms (like in other pages)
- **PageHeader** component for page titles

---

## 📊 Data Models

### Lead
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'NEW' | 'CONVERTED';
  createdAt?: string;
}
```

### Opportunity
```typescript
interface Opportunity {
  id: string;
  name: string;
  value: number;
  stage: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'CLOSED_WON' | 'CLOSED_LOST';
  accountId: string;
  createdAt?: string;
}
```

### Account
```typescript
interface Account {
  id: string;
  name: string;
  createdAt?: string;
}
```

---

## ⚠️ Important Notes

1. **Storage**: The provided code uses in-memory arrays. For production, you'll need:
   - Database integration (MongoDB, PostgreSQL, etc.)
   - Or integrate with your existing staging backend storage

2. **Authentication**: The routes don't have authentication middleware. You'll need to:
   - Add JWT verification (jsonwebtoken is already in dependencies)
   - Use your existing `getAuthHeaders()` from `apiClient.ts`

3. **Error Handling**: Add proper error handling and validation

4. **Validation**: Add input validation for lead creation and conversion

5. **Real-time Updates**: Consider adding MQTT integration (like your pages system) for real-time CRM updates

---

## 🚀 Quick Start Implementation

1. **Create API module**: `frontend/src/api/crm.ts`
2. **Create Leads page**: `frontend/src/pages/LeadsManagementPage.tsx`
3. **Create Opportunities page**: `frontend/src/pages/OpportunitiesPage.tsx`
4. **Update sidebar**: Add CRM menu items
5. **Update App.tsx**: Add routes
6. **Test**: Create leads, convert to opportunities, view opportunities

---

## 📝 Summary

This CRM module provides:
- ✅ Lead management (create, list, convert)
- ✅ Opportunity tracking
- ✅ Account creation
- ✅ Basic sales pipeline functionality

**Integration Points:**
- Backend: Add to staging backend or create local API routes
- Frontend: Create CRM pages in `frontend/src/pages/`
- Navigation: Add to sidebar in `frontend/src/layout/sidebarData.ts`
- API: Create `frontend/src/api/crm.ts` following existing patterns

The module is simple and can be extended with more features like:
- Contact management
- Deal pipeline stages
- Sales reports
- Email integration
- Activity tracking
