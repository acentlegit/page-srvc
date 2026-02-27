# Backend Setup Guide

## ✅ Backend Implementation Complete!

All backend API endpoints have been created. Here's how to set it up:

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- Express.js (web server)
- PostgreSQL client (pg)
- File parsing libraries (xlsx, mammoth, pdf-parse)
- Multer (file uploads)
- Other dependencies

### 2. Set Up Database

1. Make sure PostgreSQL is running
2. Create the database:
```bash
createdb citizen_intake
```

3. Run the schema:
```bash
psql -U postgres -d citizen_intake -f ../frontend/database/citizen-services-schema.sql
```

### 3. Configure Environment

Create a `.env` file in the `backend` directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=citizen_intake
DB_PASSWORD=yourpassword
DB_PORT=5432

PORT=3000
NODE_ENV=development

BEAM_API_BASE_URL=https://api.beamdev.hu
BEAM_API_KEY=your_beam_api_key

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

All endpoints are prefixed with `/api/custom-applications/citizen-services`

### Form Builder
- ✅ `POST /intake-forms/upload` - Upload Excel/Word/PDF template
- ✅ `POST /intake-forms/generate` - Generate form from template
- ✅ `GET /intake-forms` - List all forms
- ✅ `GET /intake-forms/:id` - Get form details
- ✅ `PUT /intake-forms/:id` - Update form
- ✅ `DELETE /intake-forms/:id` - Delete form

### Submissions
- ✅ `POST /intake-forms/:formId/submit` - Submit intake form
- ✅ `GET /submissions` - List all submissions
- ✅ `GET /submissions/:id` - Get submission details
- ✅ `PUT /submissions/:id/status` - Update submission status

### Programs
- ✅ `GET /programs` - List all programs
- ✅ `POST /programs` - Create program
- ✅ `POST /programs/:id/apply` - Apply to program

### Analytics
- ✅ `GET /analytics/overview` - Overview statistics
- ✅ `GET /analytics/programs` - Program statistics
- ✅ `GET /analytics/demographics` - Demographics breakdown

### Beam Integration
- ✅ `POST /api/beam/sync-citizen` - Sync citizen data to Beam

## File Upload Support

The backend automatically parses:
- **Excel files** (.xlsx, .xls) - Extracts headers as form fields
- **Word documents** (.docx, .doc) - Extracts text patterns as form fields
- **PDF files** (.pdf) - Extracts text patterns as form fields

Uploaded files are stored in the `uploads` directory.

## Testing

1. **Health Check:**
```bash
curl http://localhost:3000/health
```

2. **List Forms:**
```bash
curl http://localhost:3000/api/custom-applications/citizen-services/intake-forms
```

3. **Upload Template:**
```bash
curl -X POST http://localhost:3000/api/custom-applications/citizen-services/intake-forms/upload \
  -F "file=@/path/to/your/file.xlsx"
```

## Frontend Integration

The frontend is already configured to use these endpoints. Once the backend is running:

1. Make sure the frontend's `.env` has:
```env
VITE_API_BASE_URL=http://localhost:3000
```

2. The frontend will automatically connect to the backend!

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Make sure database exists: `psql -l | grep citizen_intake`

### File Upload Errors
- Check `UPLOAD_DIR` exists and is writable
- Verify `MAX_FILE_SIZE` is sufficient
- Check file type is supported (.xlsx, .docx, .pdf)

### Port Already in Use
- Change `PORT` in `.env` to a different port
- Or stop the process using port 3000

## Next Steps

1. ✅ Backend is ready
2. ✅ Frontend is ready
3. ⏭️ Set up database
4. ⏭️ Start backend server
5. ⏭️ Test the full flow!

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── routes/
│   ├── intakeForms.js       # Form builder endpoints
│   ├── submissions.js       # Submission endpoints
│   ├── programs.js          # Program endpoints
│   └── analytics.js         # Analytics endpoints
├── utils/
│   ├── fileParser.js        # Excel/Word/PDF parsing
│   └── beamIntegration.js   # Beam API integration
├── server.js                # Main server file
├── package.json
└── README.md
```

All endpoints are implemented and ready to use! 🚀
