const express = require('express');
const Program = require('../models/Program');
const ProgramApplication = require('../models/ProgramApplication');
const IntakeSubmission = require('../models/IntakeSubmission');

const router = express.Router();

// List all programs
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });

    const formattedPrograms = programs.map(program => ({
      id: program._id,
      name: program.name,
      description: program.description,
      is_active: program.is_active,
      created_at: program.createdAt,
      updated_at: program.updatedAt,
    }));

    res.json(formattedPrograms);
  } catch (error) {
    console.error('List programs error:', error);
    res.status(500).json({ error: error.message || 'Failed to list programs' });
  }
});

// Create program
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Program name is required' });
    }

    const program = new Program({
      name,
      description: description || null,
      is_active: true,
    });

    const savedProgram = await program.save();

    res.json({
      id: savedProgram._id,
      name: savedProgram.name,
      description: savedProgram.description,
      is_active: savedProgram.is_active,
      created_at: savedProgram.createdAt,
      updated_at: savedProgram.updatedAt,
    });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ error: error.message || 'Failed to create program' });
  }
});

// Apply to program
router.post('/:id/apply', async (req, res) => {
  try {
    const { id: programId } = req.params;
    const { submission_id } = req.body;

    if (!submission_id) {
      return res.status(400).json({ error: 'submission_id is required' });
    }

    // Check if program exists
    const program = await Program.findOne({ _id: programId, is_active: true });

    if (!program) {
      return res.status(404).json({ error: 'Program not found or inactive' });
    }

    // Check if submission exists
    const submission = await IntakeSubmission.findById(submission_id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Create application
    const application = new ProgramApplication({
      submission_id,
      program_id: programId,
      status: 'Pending',
    });

    const savedApplication = await application.save();

    res.json({
      id: savedApplication._id,
      submission_id: savedApplication.submission_id,
      program_id: savedApplication.program_id,
      status: savedApplication.status,
      created_at: savedApplication.createdAt,
      updated_at: savedApplication.updatedAt,
    });
  } catch (error) {
    console.error('Apply to program error:', error);
    res.status(500).json({ error: error.message || 'Failed to apply to program' });
  }
});

module.exports = router;
