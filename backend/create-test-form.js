/**
 * Script to create a test intake form directly
 * This helps verify the system is working
 */

require('dotenv').config();
const mongoose = require('mongoose');
const IntakeForm = require('./models/IntakeForm');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citizen_intake';

async function createTestForm() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test form with sample fields
    const testForm = new IntakeForm({
      name: 'Citizen Services Intake Form',
      description: 'Comprehensive intake form for citizen services',
      fields_config: [
        {
          id: 'field1',
          name: 'full_name',
          label: 'Full Legal Name',
          type: 'text',
          required: true,
        },
        {
          id: 'field2',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
        },
        {
          id: 'field3',
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          required: false,
        },
        {
          id: 'field4',
          name: 'date_of_birth',
          label: 'Date of Birth',
          type: 'date',
          required: true,
        },
        {
          id: 'field5',
          name: 'address',
          label: 'Address',
          type: 'text',
          required: false,
        },
        {
          id: 'field6',
          name: 'zip_code',
          label: 'ZIP Code',
          type: 'text',
          required: false,
        },
        {
          id: 'field7',
          name: 'household_size',
          label: 'Household Size',
          type: 'number',
          required: false,
        },
        {
          id: 'field8',
          name: 'services_requested',
          label: 'Services Requested',
          type: 'multiselect',
          required: false,
          options: ['Food Assistance', 'Housing', 'Legal Aid', 'Medical', 'Employment'],
        },
        {
          id: 'field9',
          name: 'urgency_level',
          label: 'Urgency Level',
          type: 'select',
          required: true,
          options: ['Emergency', 'High', 'Standard'],
        },
      ],
      is_active: true,
    });

    const savedForm = await testForm.save();
    console.log('✅ Test form created successfully!');
    console.log('Form ID:', savedForm._id);
    console.log('Form Name:', savedForm.name);
    console.log('Fields:', savedForm.fields_config.length);
    console.log('');
    console.log('🎉 You can now see this form in the frontend!');
    console.log('Refresh the "Intake Forms" page to see it.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test form:', error);
    process.exit(1);
  }
}

createTestForm();
