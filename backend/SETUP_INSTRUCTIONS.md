# Backend Setup Instructions

## ✅ Dependencies Installed!

All npm packages have been installed successfully.

## Next Steps

### 1. Set Up PostgreSQL Database

You need to have PostgreSQL installed and running. Then:

**Option A: Use the setup script (recommended)**
```bash
# Make sure PostgreSQL is running first
# Then update .env with your database password
node setup-database.js
```

**Option B: Manual setup**
```bash
# 1. Create database
createdb citizen_intake

# 2. Run schema
psql -U postgres -d citizen_intake -f ../frontend/database/citizen-services-schema.sql
```

### 2. Configure Environment Variables

Edit `backend/.env` file and update:
- `DB_PASSWORD` - Your PostgreSQL password
- `DB_USER` - Your PostgreSQL username (default: postgres)
- `DB_HOST` - Database host (default: localhost)
- `BEAM_API_KEY` - Your Beam API key (if you have one)

### 3. Start the Server

```bash
npm start
```

Or for development (auto-reload on changes):
```bash
npm run dev
```

## Testing

### Test Server (without database)
```bash
node test-server.js
```
This will start a simple server to test if everything works.

### Test Database Connection
```bash
node setup-database.js
```
This will create the database and tables if they don't exist.

### Test Full Server
```bash
npm start
```
Then visit: http://localhost:3000/health

## Troubleshooting

### PostgreSQL Not Running
- **Windows**: Check Services → PostgreSQL
- **Mac/Linux**: `sudo service postgresql start` or `brew services start postgresql`

### Database Connection Error
- Check PostgreSQL is running
- Verify credentials in `.env`
- Make sure database exists

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or stop the process using port 3000

## Current Status

✅ Dependencies installed
⏳ Database setup needed
⏳ Server ready to start

Once PostgreSQL is set up, you can start the full server!
