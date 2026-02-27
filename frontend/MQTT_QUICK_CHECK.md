# Quick MQTT Connection Check

## ✅ Current Configuration
- **MQTT URL**: `wss://mqtt.staging.beamdev.hu:443/mqtt`
- **Status**: Needs verification

## 🔍 How to Find the Correct MQTT URL

### Quick Steps:
1. **Open**: `https://live.staging.beam.live/dashboard`
2. **Press**: `F12` (Open DevTools)
3. **Click**: `Network` tab
4. **Filter**: Type `ws` or select `WS` filter
5. **Look for**: WebSocket connections (they show as "WS" type)
6. **Find**: Connection with URL containing `mqtt` or `ws://`/`wss://`
7. **Copy**: The full URL (e.g., `wss://mqtt.staging.beamdev.hu:443/mqtt`)

### What to Look For:
- Connection name might be: `mqtt`, `websocket`, `ws`, or similar
- URL format: `wss://hostname:port/path` or `ws://hostname:port/path`
- Common ports: `443`, `9001`, `8080`, `8883`

## 🔄 Update .env File

Once you have the URL:

1. Open `frontend/.env`
2. Find line: `VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:443/mqtt`
3. Replace with your found URL
4. Save file
5. **Restart dev server**: `npm run dev`

## 🧪 Test Connection

After restarting:

1. Open `http://localhost:5173`
2. Open Console (F12)
3. Look for: `✅ MQTT connected: wss://...`
4. If you see errors, try the alternative URLs below

## 🔄 Alternative URLs to Try

If the current URL doesn't work, try these (one at a time):

```env
# Option 1 (Current)
VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:443/mqtt

# Option 2
VITE_MQTT_BROKER_URL=ws://mqtt.staging.beamdev.hu:9001

# Option 3
VITE_MQTT_BROKER_URL=wss://staging.beamdev.hu:443/mqtt

# Option 4
VITE_MQTT_BROKER_URL=ws://staging.beamdev.hu:9001/mqtt

# Option 5
VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:443/ws
```

**Test each one**:
- Update `.env`
- Restart server
- Check console
- Move to next if it fails

## ❌ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` | Wrong URL/port | Try different URL |
| `CORS error` | Broker blocks localhost | May need VPN |
| `SSL/TLS error` | Certificate issue | Try `ws://` instead of `wss://` |
| `Timeout` | Network/firewall | Check VPN, contact backend team |
| `Authentication required` | Needs username/password | Add to `.env` (see below) |

### If Authentication Required:
Add to `.env`:
```env
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
```

## 📞 Need Help?

If you can't find the URL:
- **Contact backend team** - They have the MQTT broker details
- **Check staging docs** - May have configuration info
- **Try all URLs above** - One should work
