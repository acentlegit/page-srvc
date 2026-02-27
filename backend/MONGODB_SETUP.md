# MongoDB Setup Guide

## ✅ MongoDB Implementation Complete!

The backend has been converted to use **MongoDB** instead of PostgreSQL. MongoDB is actually a better fit for this use case since we're storing JSON data!

## Quick Start

### 1. Install MongoDB

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Update Environment Variables

Update `backend/.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/citizen_intake

# Server Configuration
PORT=3000
NODE_ENV=development

# Beam API Configuration
BEAM_API_BASE_URL=https://api.beamdev.hu
BEAM_API_KEY=your_beam_api_key

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**For MongoDB Atlas (cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/citizen_intake
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Windows (if installed as service, it should auto-start)
# Or manually:
mongod

# Mac/Linux
brew services start mongodb-community
# or
sudo systemctl start mongodb
```

### 4. Start the Server

```bash
cd backend
npm start
```

This will use MongoDB by default. The server will automatically create the database and collections when you first use them!

## Benefits of MongoDB

✅ **No schema setup needed** - Collections are created automatically
✅ **Better for JSON data** - Perfect for form configurations and submission data
✅ **Flexible schema** - Easy to add new fields
✅ **Native JSON support** - No need to convert between SQL and JSON

## MongoDB vs PostgreSQL

| Feature | MongoDB | PostgreSQL |
|---------|---------|------------|
| Setup | ✅ Automatic | ⚠️ Requires schema |
| JSON Data | ✅ Native support | ⚠️ Requires conversion |
| Flexibility | ✅ Schema-less | ⚠️ Fixed schema |
| Best For | JSON/NoSQL data | Relational data |

## Project Structure

```
backend/
├── config/
│   └── database-mongodb.js    # MongoDB connection
├── models/                     # Mongoose models
│   ├── FormTemplate.js
│   ├── IntakeForm.js
│   ├── Citizen.js
│   ├── IntakeSubmission.js
│   ├── Program.js
│   └── ProgramApplication.js
├── routes/
│   ├── intakeForms-mongodb.js
│   ├── submissions-mongodb.js
│   ├── programs-mongodb.js
│   └── analytics-mongodb.js
└── server-mongodb.js          # Main server (MongoDB)
```

## Testing

1. **Check MongoDB is running:**
```bash
mongosh
# or
mongo
```

2. **Start the server:**
```bash
npm start
```

3. **Test health endpoint:**
```bash
curl http://localhost:3000/health
```

## Using Both Databases

If you want to keep both options:

- **MongoDB:** `npm start` (default)
- **PostgreSQL:** `npm run start:postgres`

## Troubleshooting

### MongoDB Not Running
- Check if MongoDB service is running
- Try: `mongosh` to test connection
- Check MongoDB logs

### Connection Error
- Verify `MONGODB_URI` in `.env`
- Check MongoDB is accessible
- For Atlas, check network access settings

### Port Already in Use
- Change `PORT` in `.env`
- Or stop the process using port 3000

## Next Steps

1. ✅ MongoDB models created
2. ✅ Routes updated for MongoDB
3. ✅ Server configured for MongoDB
4. ⏭️ Start MongoDB service
5. ⏭️ Start the server: `npm start`

That's it! MongoDB is much simpler to set up than PostgreSQL for this use case! 🎉
