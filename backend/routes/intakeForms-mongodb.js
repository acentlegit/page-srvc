const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { parseFile } = require('../utils/fileParser');
const FormTemplate = require('../models/FormTemplate');
const IntakeForm = require('../models/IntakeForm');
const Citizen = require('../models/Citizen');
const IntakeSubmission = require('../models/IntakeSubmission');
const { beamIntegrationApi } = require('../utils/beamIntegration');
const { assessNeeds, generateCaseId } = require('../utils/needsAssessment');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.docx', '.doc', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel, Word, and PDF files are allowed.'));
    }
  },
});

// Upload template file and extract fields
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.originalname.endsWith('.xlsx') || req.file.originalname.endsWith('.xls')
      ? 'excel'
      : req.file.originalname.endsWith('.docx') || req.file.originalname.endsWith('.doc')
      ? 'word'
      : req.file.originalname.endsWith('.pdf')
      ? 'pdf'
      : 'unknown';

    if (fileType === 'unknown') {
      await fs.unlink(filePath);
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Parse file and extract fields
    const fields = await parseFile(filePath, fileType);

    // Save template to database
    const template = new FormTemplate({
      name: req.file.originalname,
      file_path: filePath,
      file_type: fileType,
      fields_json: fields,
    });

    const savedTemplate = await template.save();

    res.json({
      template_id: savedTemplate._id,
      fields: fields,
      fileType: fileType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    res.status(500).json({ error: error.message || 'Failed to process file upload' });
  }
});

// Generate form from template
router.post('/generate', async (req, res) => {
  try {
    const { template_id, name } = req.body;

    if (!template_id || !name) {
      return res.status(400).json({ error: 'template_id and name are required' });
    }

    // Get template
    const template = await FormTemplate.findById(template_id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create intake form
    const form = new IntakeForm({
      template_id: template_id,
      name: name,
      fields_config: template.fields_json,
      is_active: true,
    });

    const savedForm = await form.save();

    res.json({
      id: savedForm._id,
      template_id: savedForm.template_id,
      name: savedForm.name,
      fields_config: savedForm.fields_config,
      is_active: savedForm.is_active,
      created_at: savedForm.createdAt,
      updated_at: savedForm.updatedAt,
    });
  } catch (error) {
    console.error('Generate form error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate form' });
  }
});

// List all intake forms
router.get('/', async (req, res) => {
  try {
    const forms = await IntakeForm.find().sort({ createdAt: -1 });

    const formattedForms = forms.map(form => ({
      id: form._id,
      template_id: form.template_id,
      name: form.name,
      description: form.description,
      fields_config: form.fields_config,
      is_active: form.is_active,
      created_at: form.createdAt,
      updated_at: form.updatedAt,
    }));

    res.json(formattedForms);
  } catch (error) {
    console.error('List forms error:', error);
    res.status(500).json({ error: error.message || 'Failed to list forms' });
  }
});

// Get form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await IntakeForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({
      id: form._id,
      template_id: form.template_id,
      name: form.name,
      description: form.description,
      fields_config: form.fields_config,
      is_active: form.is_active,
      created_at: form.createdAt,
      updated_at: form.updatedAt,
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: error.message || 'Failed to get form' });
  }
});

// Update form
router.put('/:id', async (req, res) => {
  try {
    const { name, description, fields_config, is_active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (fields_config !== undefined) updateData.fields_config = fields_config;
    if (is_active !== undefined) updateData.is_active = is_active;

    const form = await IntakeForm.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({
      id: form._id,
      template_id: form.template_id,
      name: form.name,
      description: form.description,
      fields_config: form.fields_config,
      is_active: form.is_active,
      created_at: form.createdAt,
      updated_at: form.updatedAt,
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ error: error.message || 'Failed to update form' });
  }
});

// Delete form
router.delete('/:id', async (req, res) => {
  try {
    const form = await IntakeForm.findByIdAndDelete(req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete form' });
  }
});

// Submit intake form (moved from submissions route to match frontend path)
router.post('/:formId/submit', async (req, res) => {
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
    // Handle fullName splitting - if no last name, use first name as last name
    const fullName = (formData.fullName || '').trim();
    const fullNameParts = fullName ? fullName.split(/\s+/) : [];
    const firstName = fullNameParts[0] || formData.first_name || 'Unknown';
    const lastNameFromFullName = fullNameParts.slice(1).join(' ').trim();
    // Use lastName from fullName, or from formData, or fallback to firstName (required field)
    const lastName = lastNameFromFullName || formData.last_name || firstName;
    
    const citizenData = {
      first_name: firstName,
      last_name: lastName, // Required field - always has a value (firstName as fallback)
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      zip_code: formData.zipCode || formData.zip_code || '',
    };
    
    // Validate required fields before creating citizen
    if (!citizenData.first_name || !citizenData.last_name) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'First name and last name are required' 
      });
    }

    // Create citizen record
    const citizen = new Citizen(citizenData);
    const savedCitizen = await citizen.save();

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

    // Add specific fields that are part of the form but not dynamic fields
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
    if (formData.householdSize) {
      submissionData.push({ field_name: 'householdSize', field_value: formData.householdSize, field_type: 'string' });
    }
    if (formData.childrenUnder18) {
      submissionData.push({ field_name: 'childrenUnder18', field_value: formData.childrenUnder18, field_type: 'string' });
    }
    if (formData.seniors65Plus) {
      submissionData.push({ field_name: 'seniors65Plus', field_value: formData.seniors65Plus, field_type: 'string' });
    }
    if (formData.hasDisability) {
      submissionData.push({ field_name: 'hasDisability', field_value: formData.hasDisability, field_type: 'string' });
    }
    if (formData.householdIncome) {
      submissionData.push({ field_name: 'householdIncome', field_value: formData.householdIncome, field_type: 'string' });
    }

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

module.exports = router;
