const express = require('express');
const { generateCaseId } = require('../utils/needsAssessment');

const router = express.Router();

// In-memory storage
let submissions = [];
let citizens = [];
let submissionCounter = 1;
let citizenCounter = 1;

// List all submissions
router.get('/', async (req, res) => {
  try {
    const formattedSubmissions = submissions.map(sub => {
      const citizen = citizens.find(c => c.id === sub.citizen_id);
      const servicesData = sub.data?.find((d) => 
        d.field_name === 'servicesRequested' || d.field_name === 'services_requested'
      );
      const servicesRequested = servicesData?.field_value || [];

      return {
        id: sub.id,
        case_id: sub.case_id,
        form_id: sub.form_id,
        citizen_id: sub.citizen_id,
        citizen: citizen ? {
          fullName: `${citizen.first_name || ''} ${citizen.last_name || ''}`.trim(),
          name: `${citizen.first_name || ''} ${citizen.last_name || ''}`.trim(),
          email: citizen.email,
          phone: citizen.phone,
        } : null,
        consent_given: sub.consent_given,
        urgency_level: sub.urgency_level,
        services_requested: Array.isArray(servicesRequested) ? servicesRequested : [],
        status: sub.status,
        submitted_at: sub.submitted_at || sub.created_at,
        created_at: sub.created_at,
      };
    });

    res.json(formattedSubmissions);
  } catch (error) {
    console.error('List submissions error:', error);
    res.status(500).json({ error: error.message || 'Failed to list submissions' });
  }
});

// Get submission by ID
router.get('/:id', async (req, res) => {
  try {
    const submission = submissions.find(s => s.id === req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const citizen = citizens.find(c => c.id === submission.citizen_id);

    res.json({
      id: submission.id,
      form_id: submission.form_id,
      citizen_id: submission.citizen_id,
      consent_given: submission.consent_given,
      urgency_level: submission.urgency_level,
      status: submission.status,
      submitted_at: submission.submitted_at,
      created_at: submission.created_at,
      citizen: citizen ? {
        first_name: citizen.first_name,
        last_name: citizen.last_name,
        email: citizen.email,
        phone: citizen.phone,
        address: citizen.address,
        zip_code: citizen.zip_code,
      } : null,
      data: submission.data,
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to get submission' });
  }
});

// Update submission status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Open', 'In Progress', 'Completed', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const submission = submissions.find(s => s.id === req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.status = status;
    submission.updated_at = new Date().toISOString();

    res.json({
      id: submission.id,
      form_id: submission.form_id,
      citizen_id: submission.citizen_id,
      status: submission.status,
      updated_at: submission.updated_at,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update status' });
  }
});

// Delete submission
router.delete('/:id', async (req, res) => {
  try {
    const index = submissions.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submissions.splice(index, 1);
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete submission' });
  }
});

// Export for use in intakeForms route
module.exports = { router, submissions, citizens, submissionCounter, citizenCounter, generateCaseId };
module.exports.setSubmissions = (data) => { submissions = data; };
module.exports.setCitizens = (data) => { citizens = data; };
module.exports.setSubmissionCounter = (val) => { submissionCounter = val; };
module.exports.setCitizenCounter = (val) => { citizenCounter = val; };
module.exports.getSubmissions = () => submissions;
module.exports.getCitizens = () => citizens;
module.exports.getSubmissionCounter = () => submissionCounter;
module.exports.getCitizenCounter = () => citizenCounter;
module.exports.incrementSubmissionCounter = () => { submissionCounter++; return submissionCounter; };
module.exports.incrementCitizenCounter = () => { citizenCounter++; return citizenCounter; };
