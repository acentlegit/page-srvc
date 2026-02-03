# MQTT Setup Instructions

## Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following:

```env
DOMAIN=tickets
VITE_DOMAIN=tickets

PORT=4000
JWT_SECRET=dev-secret
MONGO_URI=mongodb://localhost:27017
MONGO_DB=beam
REDIS_URL=redis://localhost:6380

VITE_PAGE_SERVICE_MQTT_WS=ws://localhost:9001/mqtt
VITE_TENANT_ID=acente-prod
VITE_ECOSYSTEM=sandbox

VITE_LIVEKIT_URL=ws://localhost:7883

# --- Page Provider (TopicBody MQTT RPC) ---
PAGE_PROVIDER_MQTT_URL=mqtt://localhost:1883
PAGE_PROVIDER_RPC_TIMEOUT_MS=5000

PAGE_PROVIDER_TOPIC_AGG_PAGE=service/page/TopicBody.AggregatePage
PAGE_PROVIDER_TOPIC_CREATE=service/page/TopicBody.CreatePage
PAGE_PROVIDER_TOPIC_GET=service/page/TopicBody.GetPage
PAGE_PROVIDER_TOPIC_UPDATE=service/page/TopicBody.UpdatePage
PAGE_PROVIDER_TOPIC_CONNECT=service/page/TopicBody.ConnectPage
PAGE_PROVIDER_TOPIC_DISCONNECT=service/page/TopicBody.DisconnectPage
PAGE_PROVIDER_TOPIC_AGG_MSG=service/page/TopicBody.AggregateMessage
PAGE_PROVIDER_TOPIC_OPERATE=service/page/TopicBody.OperatePage

PAGE_PROVIDER_REPLY_PREFIX=service/page/reply

# Ollama (local llama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

## Prerequisites

1. **MQTT Broker**: Start an MQTT broker with WebSocket support
   ```bash
   docker run -it --rm -p 1883:1883 -p 9001:9001 eclipse-mosquitto
   ```

2. **Backend Service**: Start the `beamlive-page-provider-backend` service
   ```bash
   cd beamlive-page-provider-backend
   npm install
   npm run start:dev
   ```

## How It Works

The frontend now uses MQTT instead of REST API:

- **MQTT Client** (`src/api/mqtt-client.ts`): Handles MQTT connection and request/reply pattern
- **Pages API** (`src/api/pages.ts`): Uses MQTT topics to interact with the backend
- **Request/Reply Pattern**: Commands are sent to topics like `service/page/TopicBody.CreatePage` and replies come back on `service/page/reply/{requestId}`

## MQTT Topics Used

- `service/page/TopicBody.AggregatePage` - Get all pages
- `service/page/TopicBody.CreatePage` - Create a new page
- `service/page/TopicBody.GetPage` - Get a specific page
- `service/page/TopicBody.UpdatePage` - Update a page
- `service/page/TopicBody.ConnectPage` - Connect user to page
- `service/page/TopicBody.DisconnectPage` - Disconnect user from page
- `service/page/TopicBody.AggregateMessage` - Get messages for a page
- `service/page/TopicBody.OperatePage` - Add/Remove members

## Event Topics (for real-time updates)

- `service/page/events/PageUpdated/{pageId}`
- `service/page/events/ConnectionsUpdated/{pageId}`
- `service/page/events/PresenceUpdated/{pageId}`
- `service/page/events/MessageCreated/{pageId}`
