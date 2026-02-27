# Application Customization Requirements - Detailed Explanation

## Overview
Your manager wants to add a new **"Application Customization"** navigation tab that allows building and customizing applications that will be packaged and shipped to customers.

## Current Structure vs. New Structure

### Current Structure:
```
Sidebar:
├── Communication
├── Events
├── People
├── Management
│   ├── Tasks
│   ├── Intake Form
│   └── ...
├── Custom Applications
│   └── Citizen Services #1
└── Settings
```

### New Structure (What We Need):
```
Sidebar:
├── Communication
├── Events
├── People
├── Management (existing - keep as is)
│   ├── Tasks
│   ├── Intake Form
│   └── ...
├── Application Customization (NEW TAB)
│   ├── Custom Applications
│   │   ├── Citizen Services #1
│   │   │   ├── Intake Forms
│   │   │   ├── Projects
│   │   │   ├── Employees
│   │   │   └── Pages
│   │   └── Citizen Services #2 (future)
│   ├── Organizations
│   │   ├── Create Organization
│   │   ├── Manage Organizations
│   │   └── Organization Admins
│   ├── Projects
│   │   ├── Create Project
│   │   └── Manage Projects
│   └── Intake Forms (reuse from Management)
└── Settings
```

## Detailed Requirements

### 1. Application Customization Tab
**Purpose:** Build and customize applications that will be shipped to customers

**Location:** New top-level navigation item in sidebar (similar to "Management")

**Contains:**
- Custom Applications (list and manage)
- Organizations (create/manage customer organizations)
- Projects (create projects within applications)
- Intake Forms (reuse existing functionality)

### 2. Organizations Management
**Purpose:** Create organizations for different customers

**Features:**
- Create new organization
- Set organization name, details
- Assign admin users to organization
- Each organization gets its own admin interface
- Organizations can have their own employees, projects, pages

**Example:**
- Organization: "Nonprofit ABC"
- Organization: "City Services Department"
- Each organization is isolated

### 3. Projects System
**Purpose:** Create projects within custom applications

**Features:**
- Projects belong to a Custom Application (e.g., Citizen Services #1)
- Example: "Employee Communication Project" within Citizen Services
- Add employees to projects
- Create pages for employees within projects
- Projects are NOT tasks (different from Management tab)

**Example Flow:**
1. Go to Application Customization
2. Select "Citizen Services #1"
3. Create new project: "Employee Communication Project"
4. Add employees to this project
5. Create pages for those employees

### 4. Custom Applications Structure
**Each Custom Application should have:**
- Intake Forms (already implemented)
- Projects (NEW)
- Employees (NEW - add employees to the application)
- Pages (NEW - create pages for the application)

**Example:**
- Citizen Services #1
  - Intake Forms ✅ (already done)
  - Projects (NEW)
  - Employees (NEW)
  - Pages (NEW)

### 5. Packaging & Deployment
**Purpose:** Package completed applications for customer deployment

**Features:**
- Package an application (export all code, data structure)
- Deploy to customer environment
- Support Google Cloud, AWS, etc.
- Each customer gets isolated deployment

**Note:** This is for future implementation, but structure should support it.

## Implementation Plan

### Phase 1: Navigation Structure
1. Add "Application Customization" to sidebar
2. Create navigation structure with sub-items
3. Set up routing

### Phase 2: Organizations
1. Create Organizations list page
2. Create Organization form (create/edit)
3. Backend API for organizations
4. Database model for organizations

### Phase 3: Projects
1. Create Projects list page (within Custom Application)
2. Create Project form
3. Backend API for projects
4. Link projects to Custom Applications

### Phase 4: Employees in Applications
1. Add employees to Custom Applications
2. Add employees to Projects
3. Employee management interface

### Phase 5: Integration
1. Integrate with existing Custom Applications
2. Connect Intake Forms to Application Customization
3. Create unified dashboard

## Key Differences from Management Tab

| Feature | Management Tab | Application Customization Tab |
|---------|---------------|------------------------------|
| Purpose | Internal management | Building customer applications |
| Tasks | ✅ Has tasks | ❌ No tasks |
| Projects | ❌ No projects | ✅ Has projects |
| Intake Forms | ✅ Has intake forms | ✅ Reuses intake forms |
| Organizations | ❌ No organizations | ✅ Has organizations |
| Shipping | ❌ Not for shipping | ✅ For packaging/shipping |

## Database Models Needed

### Organization
```javascript
{
  id: string,
  name: string,
  description: string,
  adminUsers: [userId],
  customApplications: [appId],
  createdAt: date,
  updatedAt: date
}
```

### Project
```javascript
{
  id: string,
  name: string,
  description: string,
  customApplicationId: string, // Links to Citizen Services #1, etc.
  employees: [userId],
  pages: [pageId],
  createdAt: date,
  updatedAt: date
}
```

### CustomApplication (extend existing)
```javascript
{
  id: string,
  name: string, // "Citizen Services #1"
  organizationId: string, // Optional - which org owns it
  projects: [projectId],
  employees: [userId],
  intakeForms: [formId],
  pages: [pageId],
  createdAt: date,
  updatedAt: date
}
```

## User Flow Example

1. **Admin logs in**
2. **Clicks "Application Customization"** in sidebar
3. **Sees:**
   - Custom Applications (Citizen Services #1, etc.)
   - Organizations
   - Projects
   - Intake Forms
4. **Creates Organization:**
   - Click "Organizations"
   - Create "Nonprofit ABC"
   - Assign admin users
5. **Creates Project:**
   - Go to "Citizen Services #1"
   - Create "Employee Communication Project"
   - Add employees
6. **Packages Application:**
   - When ready, package "Citizen Services #1"
   - Deploy to customer environment

## Reference Code
The provided `citizen-intake-system` folder contains:
- Simple intake form (HTML)
- Basic server.js with PostgreSQL
- Database schema
- This is reference for the intake form structure

We already have a more advanced implementation, but this shows the basic structure.
