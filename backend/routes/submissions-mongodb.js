const express = require('express');
const Citizen = require('../models/Citizen');
const IntakeSubmission = require('../models/IntakeSubmission');
const IntakeForm = require('../models/IntakeForm');
const { beamIntegrationApi } = require('../utils/beamIntegration');
const { assessNeeds, generateCaseId } = require('../utils/needsAssessment');

const router = express.Router();

// Submit intake form
router.post('/intake-forms/:formId/submit', async (req, res) => {
  try {
    const { formId } = req.params;
    const formData = req.body;

    // If formId is 'default' or 'new', use a default form or create submission without form validation
    let form = null;
    if (formId !== 'default' && formId !== 'new') {
      form = await IntakeForm.findById(formId);
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
    }

    // Extract citizen information
    const citizenData = {
      first_name: formData.fullName?.split(' ')[0] || formData.first_name || '',
      last_name: formData.fullName?.split(' ').slice(1).join(' ') || formData.last_name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      zip_code: formData.zipCode || formData.zip_code || '',
    };

    // Create citizen record
    const citizen = new Citizen(citizenData);
    const savedCitizen = await citizen.save();

    // Prepare submission data
    const submissionData = [];
    const excludedFields = ['consentGiven', 'consent_given', 'urgencyLevel', 'urgency_level', 
                           'fullName', 'first_name', 'last_name', 'email', 'phone', 
                           'address', 'zipCode', 'zip_code'];

    Object.entries(formData).forEach(([fieldName, fieldValue]) => {
      if (!excludedFields.includes(fieldName) && fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        submissionData.push({
          field_name: fieldName,
          field_value: fieldValue,
          field_type: typeof fieldValue,
        });
      }
    });

    // Generate case ID
    const caseId = generateCaseId();

    // Assess needs and generate referrals
    const referrals = assessNeeds(formData);

    // Create intake submission
    const submission = new IntakeSubmission({
      case_id: caseId,
      form_id: (form && form._id) ? form._id : null, // Use form ID if exists, otherwise null
      citizen_id: savedCitizen._id,
      consent_given: formData.consentGiven || formData.consent_given || false,
      urgency_level: formData.urgencyLevel || formData.urgency_level || 'Standard',
      status: 'Open',
      data: submissionData,
      referrals: referrals.map(ref => ({
        nonprofit_type: ref.type,
        status: 'Pending',
        priority: ref.priority,
        reason: ref.reason,
      })),
    });

    const savedSubmission = await submission.save();

    // Sync citizen data to Beam (only user information)
    try {
      await beamIntegrationApi.syncCitizen(savedCitizen._id.toString(), citizenData);
    } catch (beamError) {
      console.error('Beam sync error (non-fatal):', beamError);
      // Don't fail the submission if Beam sync fails
    }

    // Populate citizen data for response
    const populatedSubmission = await IntakeSubmission.findById(savedSubmission._id)
      .populate('citizen_id', 'first_name last_name email phone address zip_code');

    res.json({
      id: savedSubmission._id,
      case_id: savedSubmission.case_id,
      form_id: savedSubmission.form_id,
      citizen_id: savedSubmission.citizen_id,
      citizen: {
        fullName: `${savedCitizen.first_name} ${savedCitizen.last_name}`.trim(),
        name: `${savedCitizen.first_name} ${savedCitizen.last_name}`.trim(),
        email: savedCitizen.email,
        phone: savedCitizen.phone,
      },
      consent_given: savedSubmission.consent_given,
      urgency_level: savedSubmission.urgency_level,
      services_requested: formData.servicesRequested || formData.services_requested || [],
      status: savedSubmission.status,
      submitted_at: savedSubmission.submitted_at || savedSubmission.createdAt,
      created_at: savedSubmission.createdAt,
    });
  } catch (error) {
    console.error('Submit intake error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit intake form' });
  }
});

// List all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await IntakeSubmission.find()
      .populate('citizen_id', 'first_name last_name email phone address zip_code')
      .populate('form_id', 'name')
      .sort({ createdAt: -1 });

    const formattedSubmissions = submissions.map(sub => {
      // Extract services_requested from submission data
      const servicesData = sub.data?.find((d) => 
        d.field_name === 'servicesRequested' || d.field_name === 'services_requested'
      );
      const servicesRequested = servicesData?.field_value || [];

      return {
        id: sub._id,
        case_id: sub.case_id,
        form_id: sub.form_id,
        citizen_id: sub.citizen_id,
        citizen: sub.citizen_id ? {
          fullName: `${sub.citizen_id.first_name || ''} ${sub.citizen_id.last_name || ''}`.trim(),
          name: `${sub.citizen_id.first_name || ''} ${sub.citizen_id.last_name || ''}`.trim(),
          email: sub.citizen_id.email,
          phone: sub.citizen_id.phone,
        } : null,
        consent_given: sub.consent_given,
        urgency_level: sub.urgency_level,
        services_requested: Array.isArray(servicesRequested) ? servicesRequested : [],
        status: sub.status,
        submitted_at: sub.submitted_at || sub.createdAt,
        created_at: sub.createdAt,
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
    const submission = await IntakeSubmission.findById(req.params.id)
      .populate('citizen_id')
      .populate('form_id');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      id: submission._id,
      form_id: submission.form_id,
      citizen_id: submission.citizen_id,
      consent_given: submission.consent_given,
      urgency_level: submission.urgency_level,
      status: submission.status,
      submitted_at: submission.submitted_at,
      created_at: submission.createdAt,
      citizen: submission.citizen_id ? {
        first_name: submission.citizen_id.first_name,
        last_name: submission.citizen_id.last_name,
        email: submission.citizen_id.email,
        phone: submission.citizen_id.phone,
        address: submission.citizen_id.address,
        zip_code: submission.citizen_id.zip_code,
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

    const submission = await IntakeSubmission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      id: submission._id,
      form_id: submission.form_id,
      citizen_id: submission.citizen_id,
      status: submission.status,
      updated_at: submission.updatedAt,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update status' });
  }
});

// Delete submission
router.delete('/:id', async (req, res) => {
  try {
    const submission = await IntakeSubmission.findByIdAndDelete(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ 
      message: 'Submission deleted successfully',
      id: submission._id 
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete submission' });
  }
});

module.exports = router;
