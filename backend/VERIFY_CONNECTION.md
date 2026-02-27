# Verify Your MongoDB Connection String

## Common Issues

### 1. Check Your Connection String Format

Your `MONGODB_URI` in `.env` should look like this:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.ACTUAL_CLUSTER_ID.mongodb.net/citizen_intake?retryWrites=true&w=majority
```

**Important:**
- Replace `YOUR_USERNAME` with your actual MongoDB Atlas username
- Replace `YOUR_PASSWORD` with your actual password
- Replace `ACTUAL_CLUSTER_ID` with your actual cluster ID (from Atlas)
- Make sure there's NO `<` or `>` brackets in the connection string
- The password should NOT be URL-encoded unless it has special characters

### 2. Get Your Actual Connection String

1. Go to MongoDB Atlas
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"**
5. Copy the ENTIRE connection string
6. Replace `<password>` with your actual password
7. Add `/citizen_intake` before the `?` (if not already there)

### 3. Example of Correct Format

**From Atlas (before editing):**
```
mongodb+srv://myuser:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**After editing (what should be in .env):**
```
MONGODB_URI=mongodb+srv://myuser:MyPassword123@cluster0.abc123.mongodb.net/citizen_intake?retryWrites=true&w=majority
```

### 4. Special Characters in Password

If your password has special characters like `@`, `#`, `%`, etc., you need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `&` becomes `%26`
- etc.

### 5. Test Your Connection

After updating `.env`, test it:

```bash
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

If you see "✅ Connected!", you're good to go!

### 6. Start the Server

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB database
🚀 Server running on http://localhost:3000
```
