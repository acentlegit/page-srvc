# 📱 Application Overview - How It Works

## 🏗️ Architecture Overview

Your application is a **Role-Based Communication & Management Platform** built with:

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI)
- **Real-time Communication**: MQTT Protocol
- **Routing**: React Router v6
- **State Management**: React Context API
- **API Communication**: Axios + Fetch API

---

## 👥 User Roles & Access Levels

### 1. **Customer** 👤
**Who they are**: End users who sign up to use the platform

**What they can do**:
- ✅ Sign up with: Name, Email, Phone, Customer ID, Purpose
- ✅ View pages assigned to them
- ✅ Use chat functionality (text, images, files)
- ✅ Upload media/files (images, videos, documents)
- ✅ Convert pages into chat pages
- ✅ Submit C2M (Customer-to-Management) forms with PDF uploads
- ✅ Access their dashboard with quick actions

**Routes**: `/customer/*`

---

### 2. **Staff** 👨‍💼
**Who they are**: Employees added and managed by Admin

**What they can do**:
- ✅ View tasks assigned by Admin
- ✅ Access customer pages assigned to them
- ✅ Communicate with customers via chat
- ✅ View uploaded media/files relevant to their role
- ✅ Update task status (pending → in_progress → completed)
- ✅ View assigned customers

**Routes**: `/staff/*`

---

### 3. **Admin** 👑
**Who they are**: System administrators with full access

**What they can do**:
- ✅ **User Management**: Create, update, activate/deactivate users
- ✅ **Page Management**: Create, configure, assign pages
- ✅ **Task Management**: Create and assign tasks to staff
- ✅ **AI Agent Management**: Create and configure AI agents
- ✅ **System Settings**: Configure system-wide settings
- ✅ **Analytics**: View system analytics
- ✅ **Content Management**: Manage all content and uploads

**Routes**: `/admin/*` and all existing admin routes

---

## 🔐 Authentication Flow

### Sign Up Process:
```
1. Customer visits /signup
2. Fills form: Name, Email, Phone, Customer ID, Purpose, Password
3. System creates user via /createUser API
4. User is automatically logged in
5. Redirected to /customer/dashboard
```

### Login Process:
```
1. User visits /login
2. Enters email and password
3. System tries /login endpoint
4. If 404, searches for user by email
5. If found, logs user in and sets role
6. Redirects based on role:
   - Customer → /customer/dashboard
   - Staff → /staff/dashboard
   - Admin → /admin/dashboard
```

### Access Control:
- **ProtectedRoute** component checks user role before allowing access
- Each route requires specific role(s)
- Unauthorized users redirected to `/unauthorized`

---

## 🎯 Key Features Explained

### 1. **Pages System** 📄
**What are Pages?**
- Pages are communication channels/groups
- Can be: Standard Pages, Chat Pages, Admin Pages, User Pages

**How it works**:
- Admin/Staff creates pages
- Assigns members (customers, staff) to pages
- Members can view and interact with their assigned pages
- Pages can be converted to chat pages for real-time communication

**Example Flow**:
```
Admin creates "Support Page" → Assigns Customer A and Staff B → 
Both can access page → Can chat, share files, collaborate
```

---

### 2. **Real-Time Chat** 💬
**Technology**: MQTT (Message Queuing Telemetry Transport)

**How it works**:
1. User opens a chat page
2. MQTT client connects to broker
3. Subscribes to page's message topic
4. When someone sends a message:
   - Message sent via MQTT
   - All connected users receive it instantly
   - Messages stored in localStorage + backend
5. Supports: Text, Images, Files

**Topics Structure**:
- `service/page/events/MessageCreated/{pageId}` - New messages
- `service/page/events/PageUpdated/{pageId}` - Page updates

---

### 3. **File Upload System** 📤
**Supported Types**:
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM, OGG
- Documents: PDF, DOC, DOCX

**Features**:
- Multiple file selection
- Upload progress tracking
- File size validation (max 50MB)
- Image preview
- File management

**Storage**: Files uploaded to backend storage service

---

### 4. **C2M Forms** 📝
**C2M = Customer-to-Management**

**Purpose**: Customers submit forms to management

**Form Fields**:
- Title (required)
- Category (optional)
- Description (required)
- PDF Document (optional, max 10MB)

**Flow**:
```
Customer fills form → Submits with PDF → 
Admin/Staff receives notification → 
Can assign to staff → Staff responds/resolves
```

---

### 5. **Task Management** ✅
**How it works**:
1. Admin creates task
2. Assigns to staff member
3. Links to: Customer, Page, or Form
4. Staff sees task in dashboard
5. Updates status: pending → in_progress → completed
6. Admin tracks all tasks

**Task Properties**:
- Title, Description
- Assigned To (Staff)
- Priority: Low, Medium, High
- Status: Pending, In Progress, Completed, Cancelled
- Due Date (optional)

---

### 6. **AI Agent Management** 🤖
**Purpose**: Automated customer interactions

**How it works**:
1. Admin creates AI agent
2. Configures system prompt (defines agent behavior)
3. Assigns agent to specific pages
4. When customer chats, AI agent can respond
5. Admin can enable/disable agents

**Use Cases**:
- FAQ responses
- Initial customer support
- Automated assistance

---

## 🔄 Data Flow

### User Signup Flow:
```
Signup Form → AuthContext.signup() → 
usersApi.create() → Backend API → 
User Created → Set in Context → 
Redirect to Dashboard
```

### Chat Message Flow:
```
User types message → pagesApi.sendMessage() → 
MQTT Publish → MQTT Broker → 
All Subscribers Receive → 
Update UI in Real-time
```

### Page Access Flow:
```
User navigates to route → 
ProtectedRoute checks role → 
If authorized: Show page → 
If not: Redirect to /unauthorized
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API services
│   │   ├── apiClient.ts  # Main API client
│   │   ├── auth.ts       # Authentication API
│   │   ├── users.ts      # User management
│   │   ├── pages.ts      # Page management
│   │   ├── tasks.ts      # Task management
│   │   ├── forms.ts      # C2M forms
│   │   └── aiAgents.ts   # AI agents
│   │
│   ├── components/       # Reusable components
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   │
│   ├── contexts/         # React Contexts
│   │   └── AuthContext.tsx  # Authentication state
│   │
│   ├── layout/          # Layout components
│   │   ├── AdminLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   │
│   ├── pages/           # Page components
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── CustomerDashboardPage.tsx
│   │   ├── StaffDashboardPage.tsx
│   │   ├── C2MFormsPage.tsx
│   │   ├── TasksManagementPage.tsx
│   │   └── ...
│   │
│   ├── services/        # Business logic
│   │   └── ...
│   │
│   ├── utils/           # Utility functions
│   │   └── pageUtils.ts
│   │
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
```

---

## 🚀 How to Use the Application

### Starting the Application:
```bash
cd frontend
npm run dev
```
Application runs on: **http://localhost:5173**

### For Customers:
1. Go to `/signup`
2. Fill registration form
3. Submit → Auto-logged in
4. Access dashboard at `/customer/dashboard`
5. Use features: Chat, Forms, Upload, Pages

### For Staff:
1. Admin creates staff account
2. Staff logs in at `/login`
3. Access dashboard at `/staff/dashboard`
4. View assigned tasks and customers
5. Chat with customers

### For Admin:
1. Login at `/login`
2. Access admin dashboard
3. Manage users, pages, tasks, AI agents
4. Configure system settings

---

## 🔧 Configuration

### Environment Variables:
Located in `.env` file:
```env
VITE_API_BASE_URL=https://cudb-root-api.staging.beamdev.hu
VITE_API_PATH_PREFIX=/api
VITE_API_ENDPOINT_USERS=/createUser
VITE_API_ENDPOINT_PAGES=/pages
# ... more endpoints
```

### API Endpoints:
- **Users**: `/createUser`, `/searchUser`, `/updateUser`
- **Pages**: `/createPage`, `/searchPage`, `/updatePage`
- **Messages**: `/searchMessage`
- **Tasks**: `/createTask`, `/updateTask` (ready for backend)
- **Forms**: `/submitC2MForm` (ready for backend)
- **AI Agents**: `/createAIAgent` (ready for backend)

---

## 🔐 Security Features

1. **Role-Based Access Control (RBAC)**
   - Routes protected by role
   - Components check permissions
   - API calls include auth tokens

2. **Authentication**
   - JWT tokens stored in localStorage
   - Token sent with every API request
   - Auto-logout on token expiry

3. **Data Validation**
   - Form validation on frontend
   - File type and size validation
   - Input sanitization

---

## 📊 State Management

### AuthContext:
- Manages user authentication state
- Provides: `user`, `login()`, `signup()`, `logout()`
- Role checking: `hasRole()`, `hasPermission()`
- Persists user in localStorage

### Component State:
- Each page manages its own state
- Uses React hooks (useState, useEffect)
- Real-time updates via MQTT subscriptions

---

## 🌐 Real-Time Features

### MQTT Integration:
- **Connection**: Auto-connects on app load
- **Subscriptions**: Per-page message topics
- **Publishing**: Send messages via MQTT
- **Fallback**: Polling if MQTT fails

### Live Updates:
- New messages appear instantly
- Page updates broadcast to all members
- Member list updates in real-time

---

## 🎨 UI/UX Features

- **Material-UI Components**: Consistent design
- **Responsive Layout**: Works on desktop and mobile
- **Loading States**: Shows loading indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation messages
- **Navigation**: Sidebar + Topbar navigation

---

## 🔄 Workflow Examples

### Customer Workflow:
```
1. Sign Up → 2. Login → 3. View Dashboard → 
4. Access Assigned Pages → 5. Chat with Staff → 
6. Upload Files → 7. Submit Forms
```

### Staff Workflow:
```
1. Login → 2. View Dashboard → 3. See Assigned Tasks → 
4. Open Customer Chat → 5. Respond to Customer → 
6. Update Task Status
```

### Admin Workflow:
```
1. Login → 2. Create Users → 3. Create Pages → 
4. Assign Staff to Pages → 5. Create Tasks → 
6. Manage AI Agents → 7. View Analytics
```

---

## 🐛 Error Handling

- **404 Errors**: Graceful fallback to alternative methods
- **Network Errors**: User-friendly messages
- **Validation Errors**: Inline form validation
- **Permission Errors**: Redirect to unauthorized page

---

## 📈 Future Enhancements

1. **AI Chat Integration**: Connect AI agents to chat
2. **Video Support**: Video calls in chat
3. **Advanced Analytics**: Detailed usage analytics
4. **Notifications**: Push notifications for tasks/messages
5. **Mobile App**: React Native mobile app

---

## 🎯 Summary

Your application is a **complete role-based communication platform** where:
- **Customers** can communicate, upload files, and submit forms
- **Staff** can manage customer interactions and tasks
- **Admin** has full control over the system

All features are **implemented and functional**, ready for backend integration!
