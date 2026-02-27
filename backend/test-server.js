/**
 * Simple server test - checks if server can start
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    endpoints: {
      forms: '/api/custom-applications/citizen-services/intake-forms',
      submissions: '/api/custom-applications/citizen-services/submissions',
      programs: '/api/custom-applications/citizen-services/programs',
      analytics: '/api/custom-applications/citizen-services/analytics'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log('\n⚠️  Note: This is a test server without database connection.');
  console.log('   To run the full server, set up PostgreSQL first.\n');
});
