const axios = require('axios');
require('dotenv').config();

/**
 * Sync citizen data to Beam (only user information)
 * This is the only data that gets sent to Beam - services/programs stay on customer side
 */
async function syncCitizen(citizenId, citizenData) {
  try {
    const beamApiUrl = process.env.BEAM_API_BASE_URL || 'https://api.beamdev.hu';
    const beamApiKey = process.env.BEAM_API_KEY;

    if (!beamApiKey) {
      console.warn('Beam API key not configured - skipping sync');
      return;
    }

    // Only send user information to Beam
    const payload = {
      citizen_id: citizenId,
      first_name: citizenData.first_name,
      last_name: citizenData.last_name,
      email: citizenData.email,
      phone: citizenData.phone,
      address: citizenData.address,
      zip_code: citizenData.zip_code,
      synced_at: new Date().toISOString(),
    };

    const response = await axios.post(
      `${beamApiUrl}/api/citizens/sync`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${beamApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Citizen data synced to Beam:', citizenId);
    return response.data;
  } catch (error) {
    console.error('❌ Beam sync error:', error.message);
    // Don't throw - this is non-critical
    throw error;
  }
}

module.exports = {
  beamIntegrationApi: {
    syncCitizen,
  },
};
