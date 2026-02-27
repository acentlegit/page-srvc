const mongoose = require('mongoose');

const customApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // organizationId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Organization',
  // },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
  employees: [{
    type: String, // User IDs
  }],
  intakeForms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IntakeForm',
  }],
  pages: [{
    type: String, // Page IDs
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

customApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CustomApplication', customApplicationSchema);
