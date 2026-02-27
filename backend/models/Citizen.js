const mongoose = require('mongoose');

const CitizenSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  zip_code: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Citizen', CitizenSchema);
