const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const CustomApplication = require('../models/CustomApplication');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { customApplicationId } = req.query;
    const query = customApplicationId ? { customApplicationId } : {};
    
    const projects = await Project.find(query)
      .populate('customApplicationId', 'name')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('customApplicationId', 'name');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, description, customApplicationId, employees, pages } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    if (!customApplicationId) {
      return res.status(400).json({ error: 'Custom application ID is required' });
    }

    // Verify custom application exists
    const customApp = await CustomApplication.findById(customApplicationId);
    if (!customApp) {
      return res.status(404).json({ error: 'Custom application not found' });
    }

    const project = new Project({
      name: name.trim(),
      description: description?.trim() || '',
      customApplicationId,
      employees: employees || [],
      pages: pages || [],
    });

    const savedProject = await project.save();
    
    // Add project to custom application
    customApp.projects.push(savedProject._id);
    await customApp.save();

    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, employees, pages } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description?.trim() || '';
    if (employees !== undefined) project.employees = employees;
    if (pages !== undefined) project.pages = pages;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Remove project from custom application
    await CustomApplication.updateOne(
      { _id: project.customApplicationId },
      { $pull: { projects: project._id } }
    );

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
