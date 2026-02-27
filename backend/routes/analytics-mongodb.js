const express = require('express');
const IntakeSubmission = require('../models/IntakeSubmission');
const Program = require('../models/Program');
const ProgramApplication = require('../models/ProgramApplication');

const router = express.Router();

// Get overview statistics
router.get('/overview', async (req, res) => {
  try {
    const [totalIntakes, activePrograms, pendingApplications, completedCases, allSubmissions] = await Promise.all([
      IntakeSubmission.countDocuments(),
      Program.countDocuments({ is_active: true }),
      ProgramApplication.countDocuments({ status: 'Pending' }),
      IntakeSubmission.countDocuments({ status: 'Completed' }),
      IntakeSubmission.find(),
    ]);

    // Calculate referral statistics
    let totalReferrals = 0;
    let acceptedReferrals = 0;
    allSubmissions.forEach(sub => {
      if (sub.referrals && sub.referrals.length > 0) {
        totalReferrals += sub.referrals.length;
        acceptedReferrals += sub.referrals.filter(r => r.status === 'Accepted').length;
      }
    });

    const referralSuccessRate = totalReferrals > 0 
      ? Math.round((acceptedReferrals / totalReferrals) * 100) 
      : 0;

    res.json({
      total_intakes: totalIntakes,
      active_programs: activePrograms,
      pending_applications: pendingApplications,
      completed_cases: completedCases,
      total_referrals: totalReferrals,
      referral_success_rate: referralSuccessRate,
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: error.message || 'Failed to get overview' });
  }
});

// Get program statistics
router.get('/programs', async (req, res) => {
  try {
    const programs = await Program.find({ is_active: true });

    const stats = await Promise.all(
      programs.map(async (program) => {
        const applications = await ProgramApplication.find({ program_id: program._id });

        return {
          program_id: program._id.toString(),
          program_name: program.name,
          total_applications: applications.length,
          approved: applications.filter(a => a.status === 'Approved').length,
          pending: applications.filter(a => a.status === 'Pending').length,
          rejected: applications.filter(a => a.status === 'Rejected').length,
          waitlisted: applications.filter(a => a.status === 'Waitlisted').length,
        };
      })
    );

    // Sort by total applications
    stats.sort((a, b) => b.total_applications - a.total_applications);

    res.json(stats);
  } catch (error) {
    console.error('Get program stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to get program statistics' });
  }
});

// Get demographics breakdown
router.get('/demographics', async (req, res) => {
  try {
    const submissions = await IntakeSubmission.find().populate('citizen_id');

    const ageRanges = {};
    const householdSizes = {};
    const incomeRanges = {};
    const serviceTypes = {};

    submissions.forEach(submission => {
      submission.data.forEach(dataItem => {
        const fieldName = dataItem.field_name?.toLowerCase() || '';
        const fieldValue = dataItem.field_value;

        // Age ranges
        if (fieldName.includes('age') || fieldName.includes('dob')) {
          const age = fieldValue;
          if (age) {
            ageRanges[age] = (ageRanges[age] || 0) + 1;
          }
        }

        // Household sizes
        if (fieldName.includes('household') && fieldName.includes('size')) {
          const size = fieldValue;
          if (size) {
            householdSizes[size] = (householdSizes[size] || 0) + 1;
          }
        }

        // Income ranges
        if (fieldName.includes('income')) {
          const income = fieldValue;
          if (income) {
            incomeRanges[income] = (incomeRanges[income] || 0) + 1;
          }
        }

        // Service types
        if (fieldName.includes('service') || fieldName.includes('servicesrequested') || fieldName.includes('services_requested')) {
          let services = [];
          if (Array.isArray(fieldValue)) {
            services = fieldValue;
          } else if (typeof fieldValue === 'string') {
            try {
              services = JSON.parse(fieldValue);
            } catch {
              services = [fieldValue];
            }
          }

          services.forEach(service => {
            if (service) {
              serviceTypes[service] = (serviceTypes[service] || 0) + 1;
            }
          });
        }
      });
    });

    res.json({
      age_ranges: ageRanges,
      household_sizes: householdSizes,
      income_ranges: incomeRanges,
      service_types: serviceTypes,
    });
  } catch (error) {
    console.error('Get demographics error:', error);
    res.status(500).json({ error: error.message || 'Failed to get demographics' });
  }
});

module.exports = router;
