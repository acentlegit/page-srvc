# MongoDB Atlas Setup Steps

## Step 1: Get Your Connection String

1. **Click the "Connect" button** on your Cluster0
2. Choose **"Connect your application"**
3. Select **"Node.js"** as the driver
4. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 2: Update Your .env File

Replace `<username>` and `<password>` with your MongoDB Atlas credentials, and add the database name:

```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/citizen_intake?retryWrites=true&w=majority
```

**Important:** 
- Replace `yourusername` with your MongoDB Atlas username
- Replace `yourpassword` with your MongoDB Atlas password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- The `/citizen_intake` part is the database name (will be created automatically)

## Step 3: Configure Network Access

1. In MongoDB Atlas, go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development) or add your specific IP
4. Click **"Confirm"**

## Step 4: Create Database User (if needed)

1. Go to **"Database Access"** (left sidebar)
2. If you don't have a user, click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (remember these for your connection string!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

## Step 5: Test Connection

Once you've updated the .env file, start the server:

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB database
🚀 Server running on http://localhost:3000
```

## Troubleshooting

### Connection Error
- Check your username/password in the connection string
- Verify Network Access allows your IP
- Make sure the database user has proper permissions

### Authentication Failed
- Double-check username and password in MONGODB_URI
- Make sure special characters in password are URL-encoded

### Timeout Error
- Check your internet connection
- Verify Network Access settings in Atlas
