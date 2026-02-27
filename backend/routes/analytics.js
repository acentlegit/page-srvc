const express = require('express');
const submissionsModule = require('./submissions');
const programsModule = require('./programs');

const router = express.Router();

// Get analytics overview
router.get('/overview', async (req, res) => {
  try {
    const submissions = submissionsModule.getSubmissions();
    const programs = programsModule.getPrograms();
    
    // Calculate metrics
    const totalIntakes = submissions.length;
    const programApplications = programsModule.getProgramApplications();
    const activePrograms = programs.filter(p => {
      // A program is active if it has at least one application
      return programApplications.some(app => app.program_id === p.id);
    }).length;
    const pendingApplications = submissions.filter(s => 
      s.status === 'Open' || s.status === 'Pending' || s.status === 'In Progress'
    ).length;
    const completedCases = submissions.filter(s => 
      s.status === 'Completed' || s.status === 'Closed'
    ).length;
    
    res.json({
      total_intakes: totalIntakes,
      active_programs: activePrograms,
      pending_applications: pendingApplications,
      completed_cases: completedCases,
      total_referrals: submissions.reduce((sum, s) => sum + (s.referrals?.length || 0), 0),
      referral_success_rate: 0, // Can be calculated based on referral statuses
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: error.message || 'Failed to get analytics overview' });
  }
});

// Get program statistics
router.get('/programs', async (req, res) => {
  try {
    const programs = programsModule.getPrograms();
    const programApplications = programsModule.getProgramApplications();
    
    const stats = programs.map(program => {
      const applications = programApplications.filter(app => app.program_id === program.id);
      return {
        program_id: program.id,
        program_name: program.name,
        total_applications: applications.length,
        approved: applications.filter(app => app.status === 'approved').length,
        pending: applications.filter(app => app.status === 'pending').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
      };
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Get program stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to get program stats' });
  }
});

// Get demographics breakdown
router.get('/demographics', async (req, res) => {
  try {
    const submissions = submissionsModule.getSubmissions();
    const citizens = submissionsModule.getCitizens();
    
    const ageRanges = {};
    const householdSizes = {};
    const incomeRanges = {};
    const serviceTypes = {};
    
    submissions.forEach(sub => {
      const citizen = citizens.find(c => c.id === sub.citizen_id);
      
      // Extract age range
      const ageData = sub.data?.find(d => 
        d.field_name === 'ageRange' || d.field_name === 'age_range' || d.field_name === 'ageRange'
      );
      if (ageData?.field_value) {
        const ageRange = String(ageData.field_value);
        ageRanges[ageRange] = (ageRanges[ageRange] || 0) + 1;
      }
      
      // Extract household size
      const householdData = sub.data?.find(d => 
        d.field_name === 'householdSize' || d.field_name === 'household_size' || d.field_name === 'householdSize'
      );
      if (householdData?.field_value) {
        const size = String(householdData.field_value);
        householdSizes[size] = (householdSizes[size] || 0) + 1;
      }
      
      // Extract income range (from householdIncome)
      const incomeData = sub.data?.find(d => 
        d.field_name === 'incomeRange' || d.field_name === 'income_range' || 
        d.field_name === 'householdIncome' || d.field_name === 'household_income'
      );
      if (incomeData?.field_value) {
        const incomeRange = String(incomeData.field_value);
        incomeRanges[incomeRange] = (incomeRanges[incomeRange] || 0) + 1;
      }
      
      // Extract service types
      const servicesData = sub.data?.find(d => 
        d.field_name === 'servicesRequested' || d.field_name === 'services_requested' ||
        d.field_name === 'servicesRequested'
      );
      if (servicesData?.field_value) {
        const services = Array.isArray(servicesData.field_value) 
          ? servicesData.field_value 
          : (typeof servicesData.field_value === 'string' ? [servicesData.field_value] : []);
        services.forEach(service => {
          if (service) {
            serviceTypes[String(service)] = (serviceTypes[String(service)] || 0) + 1;
          }
        });
      }
      
      // Also check employment status
      const employmentData = sub.data?.find(d => 
        d.field_name === 'employmentStatus' || d.field_name === 'employment_status'
      );
      if (employmentData?.field_value) {
        const status = String(employmentData.field_value);
        // Could add to a separate breakdown if needed
      }
      
      // Also check veteran status
      const veteranData = sub.data?.find(d => 
        d.field_name === 'veteranStatus' || d.field_name === 'veteran_status'
      );
      if (veteranData?.field_value) {
        const status = String(veteranData.field_value);
        // Could add to a separate breakdown if needed
      }
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

// Get intake trends over time
router.get('/trends', async (req, res) => {
  try {
    const submissions = submissionsModule.getSubmissions();
    
    // Group submissions by date
    const trendsByDate = {};
    
    submissions.forEach(sub => {
      const date = new Date(sub.submitted_at || sub.created_at || Date.now()).toISOString().split('T')[0];
      trendsByDate[date] = (trendsByDate[date] || 0) + 1;
    });
    
    // Convert to array format for charts
    const trends = Object.entries(trendsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    res.json(trends);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: error.message || 'Failed to get trends' });
  }
});

module.exports = router;
