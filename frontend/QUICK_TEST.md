# ⚡ Quick 5-Minute Test

## Step 1: Check MQTT Connection (1 min)
1. Open `http://localhost:5173`
2. Press `F12` → Console tab
3. Look for: `✅ MQTT connected`

## Step 2: Test Real-Time Messaging (3 min)
1. **Window 1**: Open `http://localhost:5173`
   - Console: `localStorage.setItem('currentUserId', 'userA')`
   - Go to a page

2. **Window 2**: Open `http://localhost:5173` (incognito)
   - Console: `localStorage.setItem('currentUserId', 'userB')`
   - Go to **same page**

3. **Send messages**:
   - Window 1 sends → Should appear in Window 2 (left side, gray)
   - Window 2 sends → Should appear in Window 1 (left side, gray)
   - Should appear **within 1-2 seconds** (real-time!)

## Step 3: Visual MQTT Test (1 min)
1. Open `http://localhost:5173/mqtt-test.html`
2. Click **"Test All URLs"**
3. See which URL works (green = working)

## ✅ Success = All 3 tests pass!
