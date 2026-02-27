# Offline Mode Setup - No Backend Required

## Overview

The application has been updated to work **completely offline** without requiring any backend server. All authentication and user management now uses **localStorage** only.

## What Changed

### 1. Login Function (`AuthContext.tsx`)
- **Removed**: All backend API calls
- **Added**: Complete localStorage-based authentication
- **Behavior**: 
  - Checks localStorage for existing users
  - If user found → logs in immediately
  - If user not found → automatically creates a new user session
  - Role determined by email (admin/staff/customer)

### 2. Signup Function (`AuthContext.tsx`)
- **Removed**: Backend API calls to create users
- **Added**: localStorage-only user creation
- **Behavior**: Creates user entirely in localStorage

### 3. Logout Function (`AuthContext.tsx`)
- **Updated**: Works offline, no API calls needed

### 4. Auth API (`auth.ts`)
- **Updated**: Gracefully handles network errors
- **Behavior**: Returns empty responses instead of throwing errors when backend is unavailable

## How It Works

### Login Flow
1. User enters email and password
2. System checks `localStorage.getItem('localUsers')` for existing user
3. If found → logs in with stored user data
4. If not found → automatically creates new user session:
   - Role: `admin` if email contains "admin" or "poojitha"
   - Role: `staff` if email contains "staff" or "employee"
   - Role: `customer` otherwise
5. User data saved to localStorage
6. No network requests made

### User Storage
Users are stored in localStorage under:
- `localUsers`: Array of all users
- `currentUser`: Currently logged-in user
- `authToken`: Always set to `'local-token'`

### Role Detection
The system automatically determines user role from email:
- **Admin**: Email contains "admin" or "poojitha"
- **Staff**: Email contains "staff" or "employee"
- **Customer**: All other emails

## Benefits

✅ **No Network Errors**: Login works even without internet
✅ **No Backend Required**: Perfect for static S3 deployment
✅ **Fast**: Instant login with no API delays
✅ **Simple**: Just enter email and password (password is stored but not validated in offline mode)
✅ **Persistent**: User data persists across browser sessions

## Testing

1. **First Login**: Enter any email (e.g., `poojitha@acentle.com`)
   - System will create a new user automatically
   - Role will be determined by email content

2. **Subsequent Logins**: Use the same email
   - System will find existing user in localStorage
   - Logs in immediately

3. **Admin Access**: Use email containing "admin" or "poojitha"
   - Automatically gets admin role
   - Access to admin dashboard

## Deployment

The application is now ready for **static S3 deployment**:
- No backend server needed
- All authentication works offline
- All data stored in browser localStorage
- Perfect for static website hosting

## Notes

⚠️ **Security**: This is for demo/testing purposes. In production, you should:
- Implement proper password hashing
- Use secure authentication tokens
- Validate passwords server-side
- Use HTTPS for all connections

⚠️ **Data Persistence**: 
- Data is stored in browser localStorage
- Clearing browser data will remove all users
- Users are browser-specific (not shared across devices)

## Files Modified

1. `frontend/src/contexts/AuthContext.tsx` - Login, signup, logout functions
2. `frontend/src/api/auth.ts` - API error handling

## Build Status

✅ Application rebuilt with offline authentication
✅ Ready for S3 deployment
✅ No backend dependencies
