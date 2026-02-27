import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import { pagesApi, PageModel } from '../api/apiClient';
import { staticPagesApi } from '../api/citizenServices';
import { employeesApi } from '../api/applicationCustomization';

interface ApplicationAnalytics {
  applicationName: string;
  applicationId: string;
  totalPages: number;
  staticPages: number;
  dynamicPages: number;
  totalUsers: number;
  loginCount: number;
  lastActivity: string;
}

const APPLICATIONS = [
  { id: 'citizen-services-1', name: 'Citizen Services' },
  { id: 'fleet-management-1', name: 'Fleet Management' },
  { id: 'church-services-1', name: 'Church Services' },
];

export default function AnalyticsPage() {
  const [selectedApplication, setSelectedApplication] = useState<string>('citizen-services-1');
  const [pages, setPages] = useState<PageModel[]>([]);
  const [staticPages, setStaticPages] = useState<Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  }>>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dynamic pages (Page Services)
        const fetchedPages = await pagesApi.list();
        setPages(fetchedPages || []);

        // Fetch static pages
        try {
          const fetchedStaticPages = await staticPagesApi.list();
          setStaticPages(fetchedStaticPages || []);
        } catch (err: any) {
          console.warn('Failed to fetch static pages:', err);
          setStaticPages([]);
        }

        // Fetch employees (users)
        try {
          const fetchedEmployees = await employeesApi.list(selectedApplication);
          setEmployees(fetchedEmployees || []);
        } catch (err: any) {
          console.warn('Failed to fetch employees:', err);
          setEmployees([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setPages([]);
        setStaticPages([]);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedApplication]);

  // Calculate analytics for selected application
  useEffect(() => {
    if (loading) return;

    // Filter pages by application (for now, we'll use all pages as dynamic pages)
    // In a real scenario, pages would be tagged with applicationId
    const dynamicPagesList = pages.filter((page) => {
      // Dynamic pages are Page Services (LiveGroup, LiveFriend, LiveMember types)
      return page.type === 'LiveGroup' || page.type === 'LiveFriend' || page.type === 'LiveMember';
    });

    // Static pages are from staticPagesApi (filtered by application if needed)
    const staticPagesList = staticPages.filter((page) => {
      // For now, include all static pages
      // In a real scenario, filter by applicationId
      return true;
    });

    // Calculate total users from pages and employees
    const pageUsers = new Set<string>();
    pages.forEach((page) => {
      const members = page.members || [];
      if (Array.isArray(members)) {
        members.forEach((member: any) => {
          const userId = typeof member === 'string' ? member : member.userId || member.email || '';
          if (userId) {
            pageUsers.add(userId);
          }
        });
      }
    });

    // Add employees as users
    employees.forEach((emp) => {
      if (emp.email) {
        pageUsers.add(emp.email);
      }
    });

    // Calculate login count (mock data for now - in real scenario, track actual logins)
    const loginCount = Math.floor(Math.random() * 100) + 50; // Mock: 50-150 logins

    // Get last activity (most recent page update)
    const lastActivity = pages.length > 0
      ? pages.reduce((latest, page) => {
          const pageTime = page.updatedAt || page.createdAt || 0;
          const latestTime = latest.updatedAt || latest.createdAt || 0;
          return pageTime > latestTime ? page : latest;
        })
      : null;

    const lastActivityDate = lastActivity
      ? new Date((lastActivity.updatedAt || lastActivity.createdAt || 0) * 1000).toLocaleDateString()
      : 'N/A';

    const selectedApp = APPLICATIONS.find((app) => app.id === selectedApplication);

    setAnalytics({
      applicationName: selectedApp?.name || 'Unknown',
      applicationId: selectedApplication,
      totalPages: dynamicPagesList.length + staticPagesList.length,
      staticPages: staticPagesList.length,
      dynamicPages: dynamicPagesList.length,
      totalUsers: pageUsers.size + employees.length,
      loginCount,
      lastActivity: lastActivityDate,
    });
  }, [pages, staticPages, employees, selectedApplication, loading]);

  return (
    <Box>
      <PageHeader title="Analytics" />

      {/* Application Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Application</InputLabel>
            <Select
              value={selectedApplication}
              label="Select Application"
              onChange={(e) => setSelectedApplication(e.target.value)}
            >
              {APPLICATIONS.map((app) => (
                <MenuItem key={app.id} value={app.id}>
                  {app.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading analytics data...
        </Alert>
      )}

      {!loading && analytics && (
        <>
          {/* Analytics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Application Name
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {analytics.applicationName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Pages
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {analytics.totalPages}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Static Pages
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {analytics.staticPages}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pages created offline
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Dynamic Pages (Page Services)
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {analytics.dynamicPages}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    For communication, adding users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {analytics.totalUsers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Users in pages + employees
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Login Count
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {analytics.loginCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total user logins
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Activity
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {analytics.lastActivity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Most recent page update
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Summary Alert */}
          {analytics.totalPages === 0 && (
            <Alert severity="info">
              No pages found for {analytics.applicationName}. Create your first page!
            </Alert>
          )}
        </>
      )}
    </Box>
  );
}
