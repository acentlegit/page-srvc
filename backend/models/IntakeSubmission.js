const mongoose = require('mongoose');

const SubmissionDataSchema = new mongoose.Schema({
  field_name: String,
  field_value: mongoose.Schema.Types.Mixed, // Can store any type
  field_type: String,
}, { _id: false });

const IntakeSubmissionSchema = new mongoose.Schema({
  case_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  form_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IntakeForm',
    required: false, // Optional - allows submissions from hardcoded form (formId: 'default' or 'new')
  },
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true,
  },
  consent_given: {
    type: Boolean,
    default: false,
  },
  urgency_level: {
    type: String,
    enum: ['Emergency', 'High', 'Standard'],
    default: 'Standard',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Closed'],
    default: 'Open',
  },
  data: {
    type: [SubmissionDataSchema],
    default: [],
  },
  referrals: [{
    nonprofit_type: String,
    nonprofit_id: String,
    nonprofit_name: String,
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Accepted', 'Rejected', 'Waitlisted', 'Completed'],
      default: 'Pending',
    },
    priority: String,
    reason: String,
    notes: String,
    sent_at: Date,
    responded_at: Date,
  }],
  case_worker_notes: {
    type: String,
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('IntakeSubmission', IntakeSubmissionSchema);
