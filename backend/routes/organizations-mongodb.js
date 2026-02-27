const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('customApplications', 'name')
      .sort({ createdAt: -1 });
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('customApplications', 'name');
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Create organization
router.post('/', async (req, res) => {
  try {
    const { name, description, adminUsers, customApplications } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const organization = new Organization({
      name: name.trim(),
      description: description?.trim() || '',
      adminUsers: adminUsers || [],
      customApplications: customApplications || [],
    });

    const savedOrganization = await organization.save();
    res.status(201).json(savedOrganization);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Update organization
router.put('/:id', async (req, res) => {
  try {
    const { name, description, adminUsers, customApplications } = req.body;
    
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (name !== undefined) organization.name = name.trim();
    if (description !== undefined) organization.description = description?.trim() || '';
    if (adminUsers !== undefined) organization.adminUsers = adminUsers;
    if (customApplications !== undefined) organization.customApplications = customApplications;

    const updatedOrganization = await organization.save();
    res.json(updatedOrganization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// Delete organization
router.delete('/:id', async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

module.exports = router;
