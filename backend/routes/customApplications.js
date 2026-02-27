const express = require('express');

const router = express.Router();

// In-memory storage
let applications = [
  {
    id: 'citizen-services-1',
    _id: 'citizen-services-1',
    name: 'Citizen Services',
    description: 'Comprehensive citizen services intake system - Sample application for nonprofit organizations',
    projects: [],
    employees: [],
    intakeForms: [],
    pages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fleet-management-1',
    _id: 'fleet-management-1',
    name: 'Fleet Management',
    description: 'Complete fleet management system for vehicle operations, maintenance, compliance, and monitoring',
    projects: [],
    employees: [],
    intakeForms: [],
    pages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'church-services-1',
    _id: 'church-services-1',
    name: 'Church Services',
    description: 'Comprehensive church management system for ministry, services, contributions, sacraments, and communications',
    projects: [],
    employees: [],
    intakeForms: [],
    pages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// List all applications
router.get('/', async (req, res) => {
  try {
    res.json(applications);
  } catch (error) {
    console.error('List applications error:', error);
    res.status(500).json({ error: error.message || 'Failed to list applications' });
  }
});

// Get application by ID
router.get('/:id', async (req, res) => {
  try {
    const app = applications.find(a => a.id === req.params.id || a._id === req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(app);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: error.message || 'Failed to get application' });
  }
});

// Create application
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const app = {
      _id: `app_${Date.now()}`,
      id: `app_${Date.now()}`,
      name,
      description: description || '',
      projects: [],
      employees: [],
      intakeForms: [],
      pages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    applications.push(app);
    res.status(201).json(app);
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: error.message || 'Failed to create application' });
  }
});

// Update application
router.put('/:id', async (req, res) => {
  try {
    const app = applications.find(a => a.id === req.params.id || a._id === req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (req.body.name !== undefined) app.name = req.body.name;
    if (req.body.description !== undefined) app.description = req.body.description;
    app.updatedAt = new Date().toISOString();
    res.json(app);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: error.message || 'Failed to update application' });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const index = applications.findIndex(a => a.id === req.params.id || a._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }
    applications.splice(index, 1);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete application' });
  }
});

module.exports = router;
