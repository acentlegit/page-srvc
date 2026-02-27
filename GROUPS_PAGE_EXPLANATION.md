# Groups Page - How It Works

## Overview
The Groups page allows you to create and manage different types of groups (Static, Dynamic, and Non-Beamer) and assign users to them.

---

## Group Types Explained

### 1. **Static Groups**
- **Definition**: Fixed groups with manually assigned members
- **Use Case**: When you want to create a specific group with predetermined members
- **Example**: "Sales Team", "Support Staff", "Management"
- **Behavior**: Members are manually added/removed by admin
- **Members**: Fixed list that doesn't change automatically

### 2. **Dynamic Groups**
- **Definition**: Groups that can change based on rules or conditions
- **Use Case**: Groups that need to update automatically based on criteria
- **Example**: "Active Users", "Premium Customers", "Recent Signups"
- **Behavior**: Members can be added/removed based on dynamic rules (future feature)
- **Members**: Can change automatically based on defined criteria

### 3. **Non-Beamer Groups**
- **Definition**: Groups for users who are NOT part of the Beam system
- **Use Case**: Organizing non-Beam users separately
- **Example**: "External Partners", "Guest Users", "Non-Beam Customers"
- **Behavior**: Similar to Static groups but specifically for non-Beam users
- **Members**: Non-Beam users only

---

## How to Use the Groups Page

### Creating a Group

1. **Click one of the "Add" buttons**:
   - "Add Static" - Creates a Static group
   - "Add Dynamic" - Creates a Dynamic group
   - "Add Non Beamer" - Creates a Non-Beamer group

2. **Fill in the form**:
   - **Group Name** (required): Enter a name for the group
   - **Group Type**: Automatically set based on which button you clicked (can be changed)
   - **Description** (optional): Add a description for the group
   - **Add Members**: Check the boxes next to users you want to add to the group

3. **Click "Create"**: The group will be created and saved

### Editing a Group

1. **Click "Edit"** on any group row
2. **Modify the information**:
   - Change the group name
   - Update the description
   - Add or remove members (check/uncheck users)
3. **Click "Update"**: Changes will be saved

### Viewing Group Details

1. **Click anywhere on a group row** or click "View" button
2. **See group information**:
   - Group name and type
   - Number of members
   - Description (if provided)
   - List of all members

### Deleting a Group

1. **Click "Delete"** on a group row
2. **Confirm deletion**: Click "OK" in the confirmation dialog
3. **Group is removed**: The group and all its data will be deleted

### Searching Groups

1. **Type in the search box** at the top
2. **Filter results**: Groups are filtered by:
   - Group name
   - Group type
   - Number of users

---

## Data Flow

```
User Action → Form Submission
    ↓
Create/Update Group via API
    ↓
┌─────────────────┬─────────────────┐
│  API Success    │  API Failure    │
│  (Backend)      │  (404/Error)    │
└─────────────────┴─────────────────┘
    ↓                    ↓
Store in Backend    Store in localStorage
    ↓                    ↓
Refresh Group List ←──────┘
    ↓
Display Updated Groups
```

---

## Storage

### Backend Storage
- Groups are stored via API endpoint `/updateGroup` (for Swagger backend)
- Groups are stored in backend database

### Local Storage (Fallback)
- If API is unavailable, groups are stored in `localGroups` in localStorage
- Format: Array of Group objects with:
  - `id`: Unique identifier
  - `name`: Group name
  - `title`: Display name
  - `type`: Group type (static/dynamic/non-beamer)
  - `members`: Array of member objects
  - `users`: Number of members

---

## Group Member Structure

Each member in a group can be:
```typescript
{
  userId: string,      // User ID or email
  email: string,       // User email
  name: string        // User display name
}
```

Or simply a string (user ID or email)

---

## Features

✅ **Create Groups**: Static, Dynamic, or Non-Beamer
✅ **Edit Groups**: Update name, description, and members
✅ **Delete Groups**: Remove groups from the system
✅ **View Details**: See all group information and members
✅ **Search**: Filter groups by name, type, or member count
✅ **Member Management**: Add/remove users from groups
✅ **Type Indicators**: Color-coded chips showing group type
✅ **LocalStorage Fallback**: Works offline when API is unavailable

---

## Integration Points

### With Users
- Groups can contain any users from the system
- Users are loaded from `usersApi.list()`
- Members are displayed with their names and emails

### With Pages
- Groups can be used to assign users to pages
- Groups help organize users for page membership

### With CRM
- Groups can be used to categorize customers
- Non-Beamer groups help separate non-Beam users

---

## Example Use Cases

### Use Case 1: Create a Sales Team Group
1. Click "Add Static"
2. Name: "Sales Team"
3. Select all sales staff members
4. Click "Create"
5. Result: A static group with all sales team members

### Use Case 2: Create a Non-Beam Customer Group
1. Click "Add Non Beamer"
2. Name: "External Customers"
3. Select all non-Beam users
4. Click "Create"
5. Result: A group for non-Beam customers

### Use Case 3: Organize Users by Department
1. Create multiple Static groups:
   - "Engineering Team"
   - "Marketing Team"
   - "Support Team"
2. Assign users to appropriate groups
3. Use groups to filter/organize users in other parts of the system

---

## Technical Details

### API Endpoints Used
- `POST /searchGroup` - Search/list groups
- `POST /updateGroup` - Create/update groups
- `POST /getGroupAccount` - Get group account info
- `POST /updateGroupAccount` - Update group account

### Data Structure
```typescript
interface Group {
  id?: string
  objectId?: string
  name?: string
  title?: string
  type?: string
  description?: string
  members?: Array<{
    userId: string
    email: string
    name: string
  }>
  users?: number
  account?: any
}
```

---

## Summary

The Groups page is a **user organization tool** that allows you to:
- Create different types of groups (Static, Dynamic, Non-Beamer)
- Assign users to groups
- Manage group membership
- Organize users for easier management across the system

**Key Benefits**:
- Better user organization
- Easier user management
- Group-based filtering and assignment
- Separation of Beam and Non-Beam users
