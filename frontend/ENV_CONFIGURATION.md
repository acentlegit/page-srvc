# Environment Configuration

## Required .env File

Create a `.env` file in the `frontend/` directory with the following configuration:

```env
# Backend API Configuration
VITE_API_BASE_URL=https://cudb-root-api.staging.beamdev.hu
VITE_API_PATH_PREFIX=

# Standard API Endpoint Paths
VITE_API_ENDPOINT_PAGES=/pages
VITE_API_ENDPOINT_EVENTS=/events
VITE_API_ENDPOINT_USERS=/createUser
VITE_API_ENDPOINT_MESSAGES=/messages
VITE_API_ENDPOINT_SEARCH_USER=/searchUser
VITE_API_ENDPOINT_SEARCH_IN_USER=/searchInUser

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

# Optional: Topic header (if required by Swagger)
# VITE_API_TOPIC=pages

# MQTT Configuration
VITE_MQTT_BROKER_URL=ws://localhost:9001
VITE_MQTT_QUEUE_NAME=beam-pages
VITE_MQTT_CLIENT_ID=beam-admin-frontend
VITE_MQTT_SUBSCRIPTION_TOPIC=pages/+
```

## Notes

- All endpoint paths are read from environment variables
- Empty `VITE_API_PATH_PREFIX` means endpoints are used as-is (for Swagger)
- For local backend, set `VITE_API_BASE_URL=http://localhost:3000` and `VITE_API_PATH_PREFIX=/api`
