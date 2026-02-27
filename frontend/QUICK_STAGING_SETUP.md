# Quick Staging Connection Setup ✅

Your localhost is now configured to connect to staging environment!

## ✅ What's Configured

1. **API Backend**: `https://cudb-root-api.staging.beamdev.hu`
2. **MQTT Broker**: `wss://mqtt.staging.beamdev.hu:443/mqtt`
3. **All Swagger Endpoints**: Configured for staging

## 🚀 Next Steps

### 1. Restart Development Server

**IMPORTANT**: You MUST restart the dev server for changes to take effect!

```bash
# Stop current server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### 2. Verify Connection

1. Open `http://localhost:5173` in browser
2. Open DevTools (F12) → Console tab
3. Look for:
   - ✅ `MQTT connected: wss://mqtt.staging.beamdev.hu:443/mqtt`
   - ✅ API calls going to `cudb-root-api.staging.beamdev.hu`

### 3. Test Features

- **Create/View Pages**: Should sync with staging
- **Real-time Messaging**: Messages should appear instantly via MQTT
- **Invitations**: Send from staging, accept on localhost
- **GPS/Map**: Should work with staging data

## ⚠️ Troubleshooting

### MQTT Connection Fails?

The MQTT broker URL might need adjustment. Try these:

1. **Check actual staging MQTT URL**:
   - Open `https://live.staging.beam.live/dashboard` in browser
   - Open DevTools → Network tab
   - Look for WebSocket connections
   - Find the MQTT broker URL

2. **Common MQTT URLs**:
   ```env
   # Option 1: Secure WebSocket
   VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:443/mqtt
   
   # Option 2: Non-secure WebSocket
   VITE_MQTT_BROKER_URL=ws://mqtt.staging.beamdev.hu:9001
   
   # Option 3: Alternative path
   VITE_MQTT_BROKER_URL=wss://staging.beamdev.hu:443/mqtt
   ```

3. **Update .env file** with correct URL, then restart server

### API Calls Fail?

- Check if you need VPN access to staging
- Verify CORS is enabled on staging backend
- Check browser console for specific error messages

### Still Using Local Backend?

- Make sure `.env` file is in `frontend/` directory
- Restart dev server after any .env changes
- Clear browser cache (Ctrl+Shift+R)

## 📝 Current Configuration

Your `.env` file is configured with:
- ✅ Staging API: `https://cudb-root-api.staging.beamdev.hu`
- ✅ MQTT: `wss://mqtt.staging.beamdev.hu:443/mqtt`
- ✅ All Swagger endpoints configured

## 🔄 Switch Back to Local

To use local backend instead, update `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PATH_PREFIX=/api
VITE_MQTT_BROKER_URL=ws://localhost:9001
```

Then restart the dev server.
