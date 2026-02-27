# Fix Your MongoDB Connection String

## 🔍 Current Issue

Your `.env` file has:
```
cluster0.xxxxx.mongodb.net
```

The `xxxxx` is a placeholder that needs to be replaced with your **actual cluster ID** from MongoDB Atlas.

## ✅ How to Fix It

### Step 1: Get Your Real Cluster ID

1. **Go to MongoDB Atlas** (you're already there!)
2. **Look at your cluster name** - it shows "Cluster0"
3. **Click "Connect"** button
4. **Choose "Connect your application"**
5. **Copy the connection string** - it will have your real cluster ID

The connection string will look like:
```
mongodb+srv://poojitha_db_user:<password>@cluster0.ABC123XYZ.mongodb.net/...
```

Notice the part `cluster0.ABC123XYZ.mongodb.net` - that `ABC123XYZ` is your actual cluster ID!

### Step 2: Update Your .env File

1. Open `backend/.env` file
2. Find the line with `MONGODB_URI=`
3. Replace `xxxxx` with your actual cluster ID

**Before:**
```env
MONGODB_URI=mongodb+srv://poojitha_db_user:pass1234%40123@cluster0.xxxxx.mongodb.net/citizen_intake?retryWrites=true&w=majority
```

**After (with your real cluster ID):**
```env
MONGODB_URI=mongodb+srv://poojitha_db_user:pass1234%40123@cluster0.ABC123XYZ.mongodb.net/citizen_intake?retryWrites=true&w=majority
```

Replace `ABC123XYZ` with your actual cluster ID from Atlas!

### Step 3: Test the Connection

After updating, test it:

```bash
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

### Step 4: Start the Server

Once the test passes:

```bash
npm start
```

## 🎯 Quick Checklist

- [ ] Got connection string from Atlas "Connect" → "Connect your application"
- [ ] Found the cluster ID (the part after `cluster0.` and before `.mongodb.net`)
- [ ] Replaced `xxxxx` in `.env` with actual cluster ID
- [ ] Tested connection (should see ✅)
- [ ] Started server with `npm start`

## 💡 Tip

Your cluster ID is usually a mix of letters and numbers, like:
- `abc123xyz`
- `def456ghi`
- `mno789pqr`

It's unique to your MongoDB Atlas cluster!
