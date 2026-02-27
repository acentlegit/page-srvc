# Staging Connection Setup Guide

This guide will help you connect your localhost application to the staging environment at `https://live.staging.beam.live/dashboard`.

## Step 1: Create .env File

Create a `.env` file in the `frontend/` directory with the following content:

```env
# Staging Backend API Configuration
# Connect localhost to staging environment like https://live.staging.beam.live/dashboard
VITE_API_BASE_URL=https://cudb-root-api.staging.beamdev.hu
VITE_API_PATH_PREFIX=

# Standard API Endpoint Paths
VITE_API_ENDPOINT_PAGES=/pages
VITE_API_ENDPOINT_EVENTS=/events
VITE_API_ENDPOINT_USERS=/createUser
VITE_API_ENDPOINT_MESSAGES=/messages
VITE_API_ENDPOINT_SEARCH_USER=/searchUser
VITE_API_ENDPOINT_SEARCH_IN_USER=/searchInUser

# Swagger Group API Endpoint Paths
VITE_API_ENDPOINT_SEARCH_GROUP=/searchGroup
VITE_API_ENDPOINT_GET_GROUP_ACCOUNT=/getGroupAccount
VITE_API_ENDPOINT_UPDATE_GROUP=/updateGroup
VITE_API_ENDPOINT_UPDATE_GROUP_ACCOUNT=/updateGroupAccount

# Swagger Page API Endpoint Paths
VITE_API_ENDPOINT_CREATE_PAGE=/createPage
VITE_API_ENDPOINT_SEARCH_PAGE=/searchPage
VITE_API_ENDPOINT_SEARCH_IN_PAGE=/searchInPage
VITE_API_ENDPOINT_UPDATE_PAGE=/updatePage
VITE_API_ENDPOINT_SYNC_PAGE=/syncPage
VITE_API_ENDPOINT_CONNECT_PAGE=/connectPage
VITE_API_ENDPOINT_DISCONNECT_PAGE=/disconnectPage
VITE_API_ENDPOINT_SEARCH_MESSAGE=/searchMessage
VITE_API_ENDPOINT_DISCONNECT=/disconnect
VITE_API_ENDPOINT_OPERATE_PAGE=/operatePage
VITE_API_ENDPOINT_FIND_USERS_TO_PAGE=/findUsersToPage
VITE_API_ENDPOINT_DO_BULK=/doBulk

# MQTT Configuration for Staging
# IMPORTANT: Update these with actual staging MQTT broker details
# Common formats:
# - wss://mqtt.staging.beamdev.hu:443/mqtt (secure WebSocket)
# - ws://mqtt.staging.beamdev.hu:9001 (non-secure WebSocket)
VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:443/mqtt
VITE_MQTT_QUEUE_NAME=beam-pages
VITE_MQTT_CLIENT_ID=beam-admin-frontend-localhost
VITE_MQTT_SUBSCRIPTION_TOPIC=pages/+

# MQTT Authentication (if required by staging)
# Uncomment and fill in if MQTT requires authentication
# VITE_MQTT_USERNAME=your_username
# VITE_MQTT_PASSWORD=your_password

# Tenant and Ecosystem Configuration
VITE_TENANT_ID=acente-prod
VITE_ECOSYSTEM=sandbox
```

## Step 2: Verify MQTT Broker URL

**IMPORTANT**: You need to get the correct MQTT broker URL from your staging environment. Common options:

1. **Check staging dashboard**: Look at the network requests in browser DevTools when using `https://live.staging.beam.live/dashboard`
2. **Contact your backend team**: They should provide the MQTT broker URL
3. **Common staging MQTT URLs**:
   - `wss://mqtt.staging.beamdev.hu:443/mqtt` (secure)
   - `ws://mqtt.staging.beamdev.hu:9001` (non-secure)
   - `wss://staging.beamdev.hu:443/mqtt`

## Step 3: Restart Development Server

After creating/updating the `.env` file:

1. **Stop the current dev server** (Ctrl+C in terminal)
2. **Restart the dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

## Step 4: Verify Connection

1. Open `http://localhost:5173` in your browser
2. Open browser DevTools (F12) → Console tab
3. Look for these messages:
   - `✅ MQTT connected: wss://...`
   - `✅ Subscribed to service/page/events/MessageCreated/...`
   - API calls should go to `https://cudb-root-api.staging.beamdev.hu`

## Troubleshooting

### MQTT Connection Fails
- Check if the MQTT broker URL is correct
- Verify you're connected to VPN (if required)
- Check browser console for CORS or connection errors
- Try different MQTT URL formats (wss:// vs ws://)

### API Calls Fail (404/Network Error)
- Verify `VITE_API_BASE_URL` is correct
- Check if you need VPN access to staging
- Verify `VITE_API_PATH_PREFIX` is empty (not `/api`)
- Check browser console for CORS errors

### Still Using Local Backend
- Make sure `.env` file is in `frontend/` directory (not root)
- Restart dev server after creating `.env`
- Check that environment variables start with `VITE_`
- Clear browser cache and hard refresh (Ctrl+Shift+R)

## Testing Real-time Features

Once connected to staging:

1. **Create a page** on staging dashboard
2. **Open localhost** and navigate to the same page
3. **Send messages** - they should sync in real-time via MQTT
4. **Test invitations** - send from staging, accept on localhost

## Switching Back to Local Backend

To switch back to local backend, update `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PATH_PREFIX=/api
VITE_MQTT_BROKER_URL=ws://localhost:9001
```

Then restart the dev server.
