/**
 * Needs Assessment Logic
 * Routes citizens to appropriate nonprofits based on their needs
 */

/**
 * Determine which nonprofits should receive referrals based on intake data
 * @param {Object} submissionData - The intake submission data
 * @returns {Array} Array of recommended nonprofit types/services
 */
function assessNeeds(submissionData) {
  const referrals = [];
  const services = submissionData.servicesRequested || submissionData.services_requested || [];
  const currentSituation = submissionData.currentSituation || submissionData.current_situation || [];
  const ageRange = submissionData.ageRange || submissionData.age_range;
  const hasDisability = submissionData.hasDisability === 'yes' || submissionData.has_disability === 'yes';

  // Housing + Eviction → Route to Housing Legal + Rental Assistance nonprofits
  if (services.includes('Housing / Rent Support') || services.includes('Housing') || 
      currentSituation.includes('Eviction notice') || currentSituation.includes('Homelessness')) {
    referrals.push({
      type: 'Housing Legal',
      priority: 'High',
      reason: 'Housing crisis detected',
    });
    referrals.push({
      type: 'Rental Assistance',
      priority: 'High',
      reason: 'Housing support needed',
    });
  }

  // Food + Senior → Route to Senior Meal + Food Pantry partners
  if (services.includes('Food Assistance') || services.includes('Food')) {
    if (ageRange === '65+' || submissionData.seniors65Plus > 0) {
      referrals.push({
        type: 'Senior Meal Program',
        priority: 'Medium',
        reason: 'Senior with food needs',
      });
    }
    referrals.push({
      type: 'Food Pantry',
      priority: 'Medium',
      reason: 'Food assistance requested',
    });
  }

  // Medical + No Insurance → Route to Community Health nonprofits
  if (services.includes('Healthcare / Insurance Navigation') || 
      services.includes('Medical') || 
      currentSituation.includes('Medical emergency')) {
    referrals.push({
      type: 'Community Health',
      priority: 'High',
      reason: 'Medical/healthcare needs',
    });
    referrals.push({
      type: 'Health Insurance Navigation',
      priority: 'Medium',
      reason: 'Insurance assistance needed',
    });
  }

  // Mental Health Crisis → Route to Mental Health Services
  if (services.includes('Mental Health Services') || 
      currentSituation.includes('Mental health crisis')) {
    referrals.push({
      type: 'Mental Health Services',
      priority: 'High',
      reason: 'Mental health crisis',
    });
  }

  // Disability Services
  if (hasDisability || services.includes('Disability Services')) {
    referrals.push({
      type: 'Disability Services',
      priority: 'Medium',
      reason: 'Disability support needed',
    });
  }

  // Legal Aid
  if (services.includes('Legal Aid') || 
      currentSituation.includes('Eviction notice') ||
      currentSituation.includes('Domestic violence')) {
    referrals.push({
      type: 'Legal Aid',
      priority: 'High',
      reason: 'Legal assistance needed',
    });
  }

  // Employment Support
  if (services.includes('Employment Support') || 
      currentSituation.includes('Unemployment')) {
    referrals.push({
      type: 'Employment Services',
      priority: 'Medium',
      reason: 'Employment support needed',
    });
  }

  // Utility Assistance
  if (services.includes('Utility Assistance') || 
      currentSituation.includes('Utility shutoff notice')) {
    referrals.push({
      type: 'Utility Assistance',
      priority: 'High',
      reason: 'Utility crisis',
    });
  }

  return referrals;
}

/**
 * Generate case ID for tracking
 */
function generateCaseId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `CASE-${timestamp}-${random}`;
}

module.exports = {
  assessNeeds,
  generateCaseId,
};
