const express = require('express');
const { assessNeeds, generateCaseId } = require('../utils/needsAssessment');
const submissionsModule = require('./submissions');

const router = express.Router();

// In-memory storage
let forms = [];
let templates = [];
let formCounter = 1;

// Submit intake form
router.post('/:formId/submit', async (req, res) => {
  try {
    const { formId } = req.params;
    const formData = req.body;

    // Extract citizen information
    const fullNameParts = formData.fullName?.trim().split(/\s+/) || [];
    const firstName = fullNameParts[0] || formData.first_name || 'Unknown';
    const lastName = fullNameParts.slice(1).join(' ') || formData.last_name || firstName;

    const citizenData = {
      id: `citizen_${submissionsModule.incrementCitizenCounter()}`,
      first_name: firstName,
      last_name: lastName,
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      zip_code: formData.zipCode || formData.zip_code || '',
      created_at: new Date().toISOString(),
    };

    // Store citizen
    const citizens = submissionsModule.getCitizens();
    citizens.push(citizenData);
    submissionsModule.setCitizens(citizens);

    // Prepare submission data
    const submissionData = [];
    const excludedFields = ['consentGiven', 'consent_given', 'urgencyLevel', 'urgency_level',
                           'fullName', 'first_name', 'last_name', 'email', 'phone',
                           'address', 'zipCode', 'zip_code', 'documents', 'additionalNotes',
                           'preferredName', 'dateOfBirth', 'preferredContact', 'primaryLanguage',
                           'city', 'state', 'county', 'householdSize', 'childrenUnder18',
                           'seniors65Plus', 'hasDisability', 'householdIncome', 'ageRange',
                           'employmentStatus', 'veteranStatus', 'currentSituation', 'servicesRequested',
                           'additionalServices', 'pagePreferences'];

    Object.entries(formData).forEach(([fieldName, fieldValue]) => {
      if (!excludedFields.includes(fieldName) && fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        submissionData.push({
          field_name: fieldName,
          field_value: fieldValue,
          field_type: typeof fieldValue,
        });
      }
    });

    // Add specific fields
    if (formData.documents && formData.documents.length > 0) {
      submissionData.push({ field_name: 'documents', field_value: formData.documents.map((f) => f.name), field_type: 'array' });
    }
    if (formData.additionalNotes) {
      submissionData.push({ field_name: 'additionalNotes', field_value: formData.additionalNotes, field_type: 'string' });
    }
    if (formData.currentSituation && formData.currentSituation.length > 0) {
      submissionData.push({ field_name: 'currentSituation', field_value: formData.currentSituation, field_type: 'array' });
    }
    if (formData.servicesRequested && formData.servicesRequested.length > 0) {
      submissionData.push({ field_name: 'servicesRequested', field_value: formData.servicesRequested, field_type: 'array' });
    }
    if (formData.additionalServices && formData.additionalServices.length > 0) {
      submissionData.push({ field_name: 'additionalServices', field_value: formData.additionalServices, field_type: 'array' });
    }
    if (formData.pagePreferences && formData.pagePreferences.length > 0) {
      submissionData.push({ field_name: 'pagePreferences', field_value: formData.pagePreferences, field_type: 'array' });
    }
    if (formData.ageRange) {
      submissionData.push({ field_name: 'ageRange', field_value: formData.ageRange, field_type: 'string' });
    }
    if (formData.employmentStatus) {
      submissionData.push({ field_name: 'employmentStatus', field_value: formData.employmentStatus, field_type: 'string' });
    }
    if (formData.veteranStatus) {
      submissionData.push({ field_name: 'veteranStatus', field_value: formData.veteranStatus, field_type: 'string' });
    }

    // Generate case ID
    const caseId = generateCaseId();

    // Assess needs and generate referrals
    const referrals = assessNeeds(formData);

    // Create intake submission
    const submission = {
      id: `submission_${submissionsModule.incrementSubmissionCounter()}`,
      case_id: caseId,
      form_id: (formId !== 'default' && formId !== 'new') ? formId : null,
      citizen_id: citizenData.id,
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
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Store submission
    const submissions = submissionsModule.getSubmissions();
    submissions.push(submission);
    submissionsModule.setSubmissions(submissions);

    res.json({
      id: submission.id,
      case_id: submission.case_id,
      form_id: submission.form_id,
      citizen_id: submission.citizen_id,
      citizen: {
        fullName: `${citizenData.first_name} ${citizenData.last_name}`.trim(),
        name: `${citizenData.first_name} ${citizenData.last_name}`.trim(),
        email: citizenData.email,
        phone: citizenData.phone,
      },
      consent_given: submission.consent_given,
      urgency_level: submission.urgency_level,
      services_requested: formData.servicesRequested || formData.services_requested || [],
      status: submission.status,
      submitted_at: submission.submitted_at,
      created_at: submission.created_at,
    });
  } catch (error) {
    console.error('Submit intake error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit intake form' });
  }
});

// List all intake forms
router.get('/', async (req, res) => {
  try {
    res.json(forms);
  } catch (error) {
    console.error('List forms error:', error);
    res.status(500).json({ error: error.message || 'Failed to list forms' });
  }
});

// Get form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = forms.find(f => f.id === req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form);
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: error.message || 'Failed to get form' });
  }
});

module.exports = router;
