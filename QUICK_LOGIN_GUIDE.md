# Quick Login Guide - Testing Chat Alignment

## Problem: "User not found" Error

If you see "User not found. Please check your email or sign up first", it means the user account doesn't exist yet.

## Solution: Create User Accounts for Testing

### Option 1: Sign Up (Recommended)

1. **Click "Sign up here"** on the login page
2. **Fill in the form:**
   - **First Name:** Poojitha
   - **Last Name:** V
   - **Email:** poojitha@acentle.com
   - **Phone:** (any phone number)
   - **Password:** (any password, e.g., "test123")
   - **Role:** Select "Admin" from dropdown
   - **Customer ID:** (leave empty for admin)

3. **Click "Sign Up"**
4. **You'll be automatically logged in**

### Option 2: Create Test Users via Signup

For testing chat alignment, create **at least 2 users**:

#### User 1: Admin
- **Email:** poojitha@acentle.com
- **Role:** Admin
- **Name:** Poojitha V

#### User 2: Customer  
- **Email:** customer1@example.com
- **Role:** Customer
- **Name:** Customer S
- **Customer ID:** 1

### Quick Test Setup

1. **Create Admin User:**
   - Go to Signup page
   - Email: `poojitha@acentle.com`
   - Role: **Admin**
   - Sign up

2. **Create Customer User:**
   - Logout
   - Go to Signup page
   - Email: `customer1@example.com`
   - Role: **Customer**
   - Customer ID: `1`
   - Sign up

3. **Test Chat:**
   - Login as customer → Send message → Should appear RIGHT
   - Login as admin → See customer's message → Should appear LEFT
   - Send message as admin → Should appear RIGHT
   - Login as customer → See admin's message → Should appear LEFT

## Already Have Users?

If users exist but login fails:

1. **Check localStorage:**
   - Open DevTools (F12)
   - Console tab
   - Type: `localStorage.getItem('localUsers')`
   - Check if your email is in the list

2. **Check email format:**
   - Make sure email matches exactly (case-insensitive)
   - Try the exact email used during signup

3. **Clear and retry:**
   - Clear localStorage: `localStorage.clear()`
   - Sign up again

## Testing Checklist

- [ ] Admin user created (poojitha@acentle.com)
- [ ] Customer user created (customer1@example.com)
- [ ] Both users can login successfully
- [ ] Both users are members of the same page
- [ ] Chat alignment works correctly

## Need Help?

Check the console logs (F12) for:
- `User logged in via email search:` - Shows successful login
- `Search results: X from API, Y from localStorage` - Shows where user was found
- `User not found` - User doesn't exist, need to sign up
