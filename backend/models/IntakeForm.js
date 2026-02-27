const mongoose = require('mongoose');

const IntakeFormSchema = new mongoose.Schema({
  template_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormTemplate',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  fields_config: {
    type: Array,
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('IntakeForm', IntakeFormSchema);
