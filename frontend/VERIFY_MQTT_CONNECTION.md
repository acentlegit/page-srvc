# Verify MQTT Connection to Staging

## Step 1: Find the Actual MQTT URL from Staging Dashboard

### Method 1: Browser DevTools (Recommended)

1. **Open staging dashboard**:
   - Go to `https://live.staging.beam.live/dashboard` in Chrome/Edge
   - Login if required

2. **Open DevTools**:
   - Press `F12` or `Right-click → Inspect`
   - Go to **Network** tab

3. **Filter WebSocket connections**:
   - Click the filter dropdown
   - Select **WS** (WebSocket) or type `ws` in the filter box
   - Look for connections that show as "WebSocket" or "WS"

4. **Find MQTT connection**:
   - Look for URLs containing:
     - `mqtt`
     - `ws://` or `wss://`
     - Port numbers like `9001`, `443`, `8080`, `8883`
   - Common patterns:
     - `wss://mqtt.staging.beamdev.hu:443/mqtt`
     - `ws://mqtt.staging.beamdev.hu:9001`
     - `wss://staging.beamdev.hu:443/mqtt`
     - `ws://staging.beamdev.hu:9001/mqtt`

5. **Copy the URL**:
   - Right-click on the WebSocket connection
   - Copy the URL
   - It should look like: `wss://hostname:port/path`

### Method 2: Check Browser Console

1. Open staging dashboard
2. Open DevTools → **Console** tab
3. Look for MQTT connection logs:
   - `MQTT connected: ...`
   - `Connecting to: ...`
   - Any WebSocket connection messages

### Method 3: Check Source Code (if accessible)

Look for MQTT configuration in staging dashboard's JavaScript:
1. DevTools → **Sources** tab
2. Search for: `mqtt`, `websocket`, `wss://`, `ws://`
3. Find the broker URL in the code

## Step 2: Update .env File

Once you have the correct MQTT URL:

1. **Open `.env` file** in `frontend/` directory
2. **Update this line**:
   ```env
   VITE_MQTT_BROKER_URL=wss://your-actual-mqtt-url-here
   ```
3. **Save the file**

## Step 3: Test Common MQTT URLs

If you can't find the exact URL, try these common staging MQTT URLs:

```env
# Option 1: Secure WebSocket (most common)
VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:443/mqtt

# Option 2: Non-secure WebSocket
VITE_MQTT_BROKER_URL=ws://mqtt.staging.beamdev.hu:9001

# Option 3: Alternative secure path
VITE_MQTT_BROKER_URL=wss://staging.beamdev.hu:443/mqtt

# Option 4: Alternative non-secure
VITE_MQTT_BROKER_URL=ws://staging.beamdev.hu:9001/mqtt

# Option 5: With different path
VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:443/ws

# Option 6: Different port
VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:8883/mqtt
```

**Test each one**:
1. Update `.env` with one URL
2. Restart dev server: `npm run dev`
3. Check browser console for connection success
4. If it fails, try the next URL

## Step 4: Verify Connection

After updating `.env` and restarting:

1. **Open localhost**: `http://localhost:5173`
2. **Open DevTools** → **Console** tab
3. **Look for**:
   ```
   ✅ MQTT connected: wss://...
   ✅ Subscribed to service/page/events/MessageCreated/...
   ```

4. **If connection fails**, you'll see:
   ```
   ❌ MQTT error: ...
   ❌ Failed to connect for subscription to ...
   ```

## Step 5: Troubleshooting

### Connection Refused
- **Cause**: Wrong URL or port
- **Fix**: Try different MQTT URLs from Step 3

### CORS Error
- **Cause**: MQTT broker doesn't allow localhost
- **Fix**: May need VPN or proxy

### SSL/TLS Error
- **Cause**: Certificate issue with `wss://`
- **Fix**: Try `ws://` instead (non-secure)

### Timeout
- **Cause**: Firewall or network blocking
- **Fix**: 
  - Check VPN connection
  - Verify network allows WebSocket connections
  - Contact backend team for MQTT broker access

### Authentication Required
- **Cause**: MQTT requires username/password
- **Fix**: Add to `.env`:
  ```env
  VITE_MQTT_USERNAME=your_username
  VITE_MQTT_PASSWORD=your_password
  ```

## Quick Test Script

After updating `.env`, run this to test:

```bash
cd frontend
npm run dev
```

Then in browser console, you should see MQTT connection logs.

## Need Help?

If you can't find the MQTT URL:
1. **Contact backend team** - They should provide the staging MQTT broker URL
2. **Check staging documentation** - May have MQTT configuration details
3. **Try the common URLs** from Step 3 - One of them might work
