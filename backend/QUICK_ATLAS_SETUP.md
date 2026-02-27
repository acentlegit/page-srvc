# Quick MongoDB Atlas Setup Guide

## 🎯 What You Need to Do Right Now

### 1. Get Your Connection String (2 minutes)

1. In MongoDB Atlas, click **"Connect"** button on your Cluster0
2. Select **"Connect your application"**
3. Choose **"Node.js"** and copy the connection string
4. It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/...`

### 2. Update .env File (1 minute)

Open `backend/.env` and replace the `MONGODB_URI` line with your connection string:

**Before:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/citizen_intake?retryWrites=true&w=majority
```

**After (with your actual credentials):**
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/citizen_intake?retryWrites=true&w=majority
```

**Important:**
- Replace `<username>` with your MongoDB Atlas username
- Replace `<password>` with your MongoDB Atlas password  
- Keep `/citizen_intake` at the end (this is your database name)
- Make sure the password doesn't have special characters that need URL encoding

### 3. Allow Network Access (1 minute)

1. In MongoDB Atlas, click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development) - this adds `0.0.0.0/0`
4. Click **"Confirm"**

### 4. Create Database User (if you don't have one)

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username and password (remember these!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 5. Test It! (30 seconds)

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB database
🚀 Server running on http://localhost:3000
```

## ✅ That's It!

Once you see "Connected to MongoDB database", you're all set! The database and collections will be created automatically when you use them.

## 🆘 Need Help?

- **Connection error?** Check username/password in connection string
- **Authentication failed?** Verify database user exists and has permissions
- **Can't connect?** Check Network Access allows your IP

## 📝 Example Connection String

Your connection string should look like this (with YOUR credentials):

```
mongodb+srv://john:MyP@ssw0rd123@cluster0.abc123.mongodb.net/citizen_intake?retryWrites=true&w=majority
```

Where:
- `john` = your username
- `MyP@ssw0rd123` = your password
- `cluster0.abc123.mongodb.net` = your cluster URL
- `citizen_intake` = database name (will be created automatically)
