const mongoose = require('mongoose');

const FormTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  file_path: {
    type: String,
  },
  file_type: {
    type: String,
    enum: ['excel', 'word', 'pdf'],
  },
  fields_json: {
    type: Array,
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FormTemplate', FormTemplateSchema);
