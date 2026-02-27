const express = require('express');
const cors = require('cors');

// Import routes (no database versions)
const intakeFormsRoutes = require('./routes/intakeForms');
const submissionsRoutes = require('./routes/submissions');
const programsRoutes = require('./routes/programs');
const analyticsRoutes = require('./routes/analytics');
const referralsRoutes = require('./routes/referrals');
const projectsRoutes = require('./routes/projects');
const employeesRoutes = require('./routes/employees');
const customApplicationsRoutes = require('./routes/customApplications');
const staticPagesRoutes = require('./routes/staticPages');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: 'None (In-Memory)',
    timestamp: new Date().toISOString() 
  });
});

// API Routes
const BASE_PATH = '/api/custom-applications/citizen-services';

app.use(`${BASE_PATH}/intake-forms`, intakeFormsRoutes);
app.use(`${BASE_PATH}/submissions`, submissionsRoutes.router);
app.use(`${BASE_PATH}/programs`, programsRoutes);
app.use(`${BASE_PATH}/analytics`, analyticsRoutes);
app.use(`${BASE_PATH}/referrals`, referralsRoutes);
app.use(`${BASE_PATH}/static-pages`, staticPagesRoutes);

// Website Customization Routes
app.use('/api/website-customization/projects', projectsRoutes);
app.use('/api/website-customization/employees', employeesRoutes);
app.use('/api/website-customization/applications', customApplicationsRoutes);

// Beam integration endpoint (separate from citizen services)
app.post('/api/beam/sync-citizen', async (req, res) => {
  try {
    const { citizen_id } = req.body;
    
    if (!citizen_id) {
      return res.status(400).json({ error: 'citizen_id is required' });
    }

    // This would call the actual Beam API
    // For now, just return success
    res.json({ 
      success: true, 
      message: 'Citizen data synced to Beam',
      citizen_id 
    });
  } catch (error) {
    console.error('Beam sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync to Beam' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API base: http://localhost:${PORT}${BASE_PATH}`);
  console.log(`💾 Storage: In-Memory (No Database)`);
});

module.exports = app;
