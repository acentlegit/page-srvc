const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  customApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomApplication',
    required: true,
  },
  employees: [{
    type: String, // User IDs
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

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
