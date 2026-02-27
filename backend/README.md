# Citizen Services Backend API

Backend server for the Citizen Services Intake System.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
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

3. **Set up database:**
Run the SQL schema file to create all tables:
```bash
psql -U postgres -d citizen_intake -f ../frontend/database/citizen-services-schema.sql
```

4. **Start the server:**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## API Endpoints

### Form Builder
- `POST /api/custom-applications/citizen-services/intake-forms/upload` - Upload template file
- `POST /api/custom-applications/citizen-services/intake-forms/generate` - Generate form from template
- `GET /api/custom-applications/citizen-services/intake-forms` - List all forms
- `GET /api/custom-applications/citizen-services/intake-forms/:id` - Get form by ID
- `PUT /api/custom-applications/citizen-services/intake-forms/:id` - Update form
- `DELETE /api/custom-applications/citizen-services/intake-forms/:id` - Delete form

### Submissions
- `POST /api/custom-applications/citizen-services/intake-forms/:formId/submit` - Submit intake form
- `GET /api/custom-applications/citizen-services/submissions` - List all submissions
- `GET /api/custom-applications/citizen-services/submissions/:id` - Get submission by ID
- `PUT /api/custom-applications/citizen-services/submissions/:id/status` - Update submission status

### Programs
- `GET /api/custom-applications/citizen-services/programs` - List all programs
- `POST /api/custom-applications/citizen-services/programs` - Create program
- `POST /api/custom-applications/citizen-services/programs/:id/apply` - Apply to program

### Analytics
- `GET /api/custom-applications/citizen-services/analytics/overview` - Get overview statistics
- `GET /api/custom-applications/citizen-services/analytics/programs` - Get program statistics
- `GET /api/custom-applications/citizen-services/analytics/demographics` - Get demographics breakdown

### Beam Integration
- `POST /api/beam/sync-citizen` - Sync citizen data to Beam

## File Upload

The server supports uploading:
- Excel files (.xlsx, .xls)
- Word documents (.docx, .doc)
- PDF files (.pdf)

Files are stored in the `uploads` directory (configurable via `UPLOAD_DIR` env variable).

## Database

Uses PostgreSQL. Make sure PostgreSQL is running and the database is created before starting the server.

## Notes

- Only citizen/user information is sent to Beam - services and programs stay on the customer side
- File parsing extracts form fields automatically from uploaded templates
- All API responses follow RESTful conventions
