const mongoose = require('mongoose');

const ProgramApplicationSchema = new mongoose.Schema({
  submission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IntakeSubmission',
    required: true,
  },
  program_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Waitlisted'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProgramApplication', ProgramApplicationSchema);
