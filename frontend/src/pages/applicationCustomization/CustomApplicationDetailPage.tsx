import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Description,
  People,
  FolderSpecial,
  Dashboard,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { customApplicationsApi } from '../../api/applicationCustomization';
import IntakeFormsListPage from '../customApplications/IntakeFormsListPage';
import ProjectsPage from './ProjectsPage';

interface CustomApplication {
  id: string;
  name: string;
  description: string;
  projects: string[];
  employees: string[];
  intakeForms: string[];
  pages: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`app-tabpanel-${index}`}
      aria-labelledby={`app-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CustomApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<CustomApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      if (id === 'citizen-services-1') {
        // Special handling for Citizen Services
        setApplication({
          id: 'citizen-services-1',
          name: 'Citizen Services',
          description: 'Comprehensive citizen services intake system - Sample application for nonprofit organizations. This is the first custom application that will be packaged and shipped to customers.',
          projects: [],
          employees: [],
          intakeForms: [],
          pages: [],
        });
      } else {
        const data = await customApplicationsApi.get(id!);
        setApplication({
          id: data._id || data.id || id!,
          name: data.name,
          description: data.description || '',
          projects: data.projects || [],
          employees: data.employees || [],
          intakeForms: data.intakeForms || [],
          pages: data.pages || [],
        });
      }
    } catch (err: any) {
      if (err.status === 404 || err.message?.includes('404')) {
        // For Citizen Services, this is OK
        if (id === 'citizen-services-1') {
          setApplication({
            id: 'citizen-services-1',
            name: 'Citizen Services',
            description: 'Comprehensive citizen services intake system',
            projects: [],
            employees: [],
            intakeForms: [],
            pages: [],
          });
        } else {
          setError('Application not found');
        }
      } else {
        setError(err.message || 'Failed to load application');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Loading..." />
        <Typography>Loading application details...</Typography>
      </Box>
    );
  }

  if (error || !application) {
    return (
      <Box>
        <PageHeader title="Error" />
        <Alert severity="error">{error || 'Application not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={application.name}
        subtitle={application.description || 'Custom application customization'}
        action={
          <Button
            variant="outlined"
            onClick={() => navigate('/website-customization/applications')}
          >
            Back to Applications
          </Button>
        }
      />

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">{application.intakeForms.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Intake Forms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">{application.projects.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">{application.employees.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">{application.pages.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Pages
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different customization sections */}
      <Card sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              icon={<Dashboard />}
              iconPosition="start"
              label="Overview"
            />
            <Tab
              icon={<Description />}
              iconPosition="start"
              label="Intake Forms"
            />
            <Tab
              icon={<FolderSpecial />}
              iconPosition="start"
              label="Projects"
            />
            <Tab
              icon={<People />}
              iconPosition="start"
              label="Employees"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Application Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {application.description || 'No description provided.'}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Stats:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                <Chip
                  label={`${application.intakeForms.length} Intake Forms`}
                  color="primary"
                />
                <Chip
                  label={`${application.projects.length} Projects`}
                  color="secondary"
                />
                <Chip
                  label={`${application.employees.length} Employees`}
                />
                <Chip
                  label={`${application.pages.length} Pages`}
                  color="default"
                />
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Packaging & Deployment:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                When this application is ready, it can be packaged and deployed to
                customer environments (Google Cloud, AWS, etc.). This page is for
                validation and customization purposes.
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                disabled
              >
                Package Application (Coming Soon)
              </Button>
            </Box>
          </CardContent>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Intake Forms for {application.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage intake forms for this application. These forms are generated
              by asking questions from start to end.
            </Typography>
            <IntakeFormsListPage />
          </CardContent>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Projects for {application.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create and manage projects within this application. Projects can
              have employees and pages associated with them.
            </Typography>
            <ProjectsPage customApplicationId={application.id} />
          </CardContent>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Employees for {application.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage employees for this application. Employees can be assigned to
              projects and pages.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Employee management interface coming soon. This will allow you to
              add people to this application and assign them to projects.
            </Alert>
          </CardContent>
        </TabPanel>
      </Card>
    </Box>
  );
}
