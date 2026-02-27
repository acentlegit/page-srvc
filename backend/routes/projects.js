const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory storage
let projects = [];

// List all projects (with optional filter by customApplicationId)
router.get('/', async (req, res) => {
  try {
    const { customApplicationId } = req.query;
    let filteredProjects = projects;
    
    if (customApplicationId) {
      filteredProjects = projects.filter(
        (p) => p.customApplicationId === customApplicationId
      );
    }
    
    res.json(filteredProjects);
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: error.message || 'Failed to list projects' });
  }
});

// Get a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = projects.find((p) => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: error.message || 'Failed to get project' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description, customApplicationId, employees, pages } = req.body;
    
    if (!name || !customApplicationId) {
      return res.status(400).json({ 
        error: 'Project name and customApplicationId are required' 
      });
    }
    
    const newProject = {
      id: uuidv4(),
      name,
      description: description || '',
      customApplicationId,
      employees: employees || [],
      pages: pages || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, employees, pages } = req.body;
    const projectIndex = projects.findIndex((p) => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const updatedProject = {
      ...projects[projectIndex],
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(employees !== undefined && { employees }),
      ...(pages !== undefined && { pages }),
      updatedAt: new Date().toISOString(),
    };
    
    projects[projectIndex] = updatedProject;
    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message || 'Failed to update project' });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const projectIndex = projects.findIndex((p) => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    projects.splice(projectIndex, 1);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete project' });
  }
});

module.exports = router;
