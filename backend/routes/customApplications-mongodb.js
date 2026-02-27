const express = require('express');
const router = express.Router();
const CustomApplication = require('../models/CustomApplication');

// Get all custom applications
router.get('/', async (req, res) => {
  try {
    const applications = await CustomApplication.find()
      .populate('projects', 'name')
      .populate('intakeForms', 'name')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching custom applications:', error);
    res.status(500).json({ error: 'Failed to fetch custom applications' });
  }
});

// Get custom application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await CustomApplication.findById(req.params.id)
      .populate('projects', 'name')
      .populate('intakeForms', 'name');
    if (!application) {
      return res.status(404).json({ error: 'Custom application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching custom application:', error);
    res.status(500).json({ error: 'Failed to fetch custom application' });
  }
});

// Create custom application
router.post('/', async (req, res) => {
  try {
    const { name, description, projects, employees, intakeForms, pages } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Application name is required' });
    }

    const application = new CustomApplication({
      name: name.trim(),
      description: description?.trim() || '',
      projects: projects || [],
      employees: employees || [],
      intakeForms: intakeForms || [],
      pages: pages || [],
    });

    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (error) {
    console.error('Error creating custom application:', error);
    res.status(500).json({ error: 'Failed to create custom application' });
  }
});

// Update custom application
router.put('/:id', async (req, res) => {
  try {
    const { name, description, projects, employees, intakeForms, pages } = req.body;
    
    const application = await CustomApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Custom application not found' });
    }

    if (name !== undefined) application.name = name.trim();
    if (description !== undefined) application.description = description?.trim() || '';
    if (projects !== undefined) application.projects = projects;
    if (employees !== undefined) application.employees = employees;
    if (intakeForms !== undefined) application.intakeForms = intakeForms;
    if (pages !== undefined) application.pages = pages;

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating custom application:', error);
    res.status(500).json({ error: 'Failed to update custom application' });
  }
});

// Delete custom application
router.delete('/:id', async (req, res) => {
  try {
    const application = await CustomApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Custom application not found' });
    }
    res.json({ message: 'Custom application deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom application:', error);
    res.status(500).json({ error: 'Failed to delete custom application' });
  }
});

module.exports = router;
