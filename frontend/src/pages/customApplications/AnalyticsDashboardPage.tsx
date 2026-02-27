import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import PageHeader from '../../components/PageHeader';
import { analyticsApi } from '../../api/citizenServices';
import type { AnalyticsOverview, ProgramStatistics, DemographicsBreakdown } from '../../types/citizenServices';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsDashboardPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [programStats, setProgramStats] = useState<ProgramStatistics[]>([]);
  const [demographics, setDemographics] = useState<DemographicsBreakdown | null>(null);
  const [trends, setTrends] = useState<Array<{ date: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewData, programData, demographicsData, trendsData] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getProgramStats(),
        analyticsApi.getDemographics(),
        analyticsApi.getTrends(),
      ]);
      setOverview(overviewData);
      setProgramStats(programData);
      setDemographics(demographicsData);
      setTrends(trendsData);
    } catch (err: any) {
      // OFFLINE MODE: Don't show errors, just use defaults
      console.log('Analytics load error (offline mode):', err);
      setOverview({
        total_intakes: 0,
        active_programs: 0,
        pending_applications: 0,
        completed_cases: 0,
        total_referrals: 0,
        referral_success_rate: 0,
      });
      setProgramStats([]);
      setDemographics({
        age_ranges: {},
        household_sizes: {},
        income_ranges: {},
        service_types: {},
      });
      setTrends([]);
      setError(null); // Don't show error in offline mode
    } finally {
      setLoading(false);
    }
  };

  const serviceTypeData = demographics?.service_types
    ? Object.entries(demographics.service_types).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const programData = programStats.map((stat) => ({
    name: stat.program_name,
    applications: stat.total_applications,
    approved: stat.approved,
    pending: stat.pending,
    rejected: stat.rejected,
  }));

  return (
    <Box>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="View statistics, program sign-ups, and demographics"
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      {!loading && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Intakes
                </Typography>
                <Typography variant="h4">{overview?.total_intakes || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Programs
                </Typography>
                <Typography variant="h4">{overview?.active_programs || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending Applications
                </Typography>
                <Typography variant="h4">{overview?.pending_applications || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Completed Cases
                </Typography>
                <Typography variant="h4">{overview?.completed_cases || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          {overview && overview.total_referrals !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Referrals
                  </Typography>
                  <Typography variant="h4">{overview.total_referrals}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          {overview && overview.referral_success_rate !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Referral Success Rate
                  </Typography>
                  <Typography variant="h4">{overview.referral_success_rate}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Charts */}
      {!loading && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Service Types Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Intakes by Service Type
                </Typography>
                {serviceTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography color="text.secondary">
                      No service type data available. Submit intake forms to see service distribution.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Program Applications Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Program Sign-ups
                </Typography>
                {programData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={programData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="applications" fill="#8884d8" name="Total Applications" />
                      <Bar dataKey="approved" fill="#82ca9d" name="Approved" />
                      <Bar dataKey="pending" fill="#ffc658" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography color="text.secondary">
                      No program data available. Create programs and applications to see statistics.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Age Range Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Age Range Distribution
                </Typography>
                {demographics && Object.keys(demographics.age_ranges || {}).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(demographics.age_ranges).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography color="text.secondary">
                      No age range data available. Submit intake forms with age information.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Household Size Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Household Size Distribution
                </Typography>
                {demographics && Object.keys(demographics.household_sizes || {}).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(demographics.household_sizes).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography color="text.secondary">
                      No household size data available. Submit intake forms with household information.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Income Range Distribution */}
          {demographics && Object.keys(demographics.income_ranges || {}).length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Income Range Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(demographics.income_ranges).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Intake Trends Over Time */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Intake Trends Over Time
                </Typography>
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" name="Intakes" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography color="text.secondary">
                      No trend data available. Submit intake forms to see trends over time.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
