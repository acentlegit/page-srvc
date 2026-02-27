const express = require('express');

const router = express.Router();

// In-memory storage
let programs = [];
let programApplications = [];

// List all programs
router.get('/', async (req, res) => {
  try {
    res.json(programs);
  } catch (error) {
    console.error('List programs error:', error);
    res.status(500).json({ error: error.message || 'Failed to list programs' });
  }
});

// Get program by ID
router.get('/:id', async (req, res) => {
  try {
    const program = programs.find(p => p.id === req.params.id);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ error: error.message || 'Failed to get program' });
  }
});

// Apply to program
router.post('/:id/apply', async (req, res) => {
  try {
    const { submission_id } = req.body;
    const program = programs.find(p => p.id === req.params.id);
    
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }
    
    const application = {
      id: `app_${Date.now()}`,
      program_id: req.params.id,
      submission_id: submission_id,
      status: 'pending',
      applied_at: new Date().toISOString(),
    };
    
    programApplications.push(application);
    res.status(201).json(application);
  } catch (error) {
    console.error('Apply to program error:', error);
    res.status(500).json({ error: error.message || 'Failed to apply to program' });
  }
});

// Export functions for use in analytics
module.exports = router;
module.exports.getPrograms = () => programs;
module.exports.getProgramApplications = () => programApplications;
module.exports.setPrograms = (data) => { programs = data; };
module.exports.setProgramApplications = (data) => { programApplications = data; };
