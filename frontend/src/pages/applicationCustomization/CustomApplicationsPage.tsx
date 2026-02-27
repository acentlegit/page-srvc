import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { customApplicationsApi } from '../../api/applicationCustomization';

interface CustomApplication {
  id: string;
  name: string;
  description: string;
  projects: string[];
  employees: string[];
  intakeForms: string[];
  pages: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CustomApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<CustomApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<CustomApplication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await customApplicationsApi.list();
      // Convert MongoDB _id to id and format data
      const formattedData: CustomApplication[] = data.map((app: any) => ({
        id: app._id || app.id,
        name: app.name,
        description: app.description || '',
        projects: app.projects || [],
        employees: app.employees || [],
        intakeForms: app.intakeForms || [],
        pages: app.pages || [],
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      }));
      // Always include default applications if they don't exist
      const defaultApps = [
        {
          id: 'citizen-services-1',
          name: 'Citizen Services',
          description: 'Comprehensive citizen services intake system - Sample application for nonprofit organizations',
          projects: [],
          employees: [],
          intakeForms: [],
          pages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'fleet-management-1',
          name: 'Fleet Management',
          description: 'Complete fleet management system for vehicle operations, maintenance, compliance, and monitoring',
          projects: [],
          employees: [],
          intakeForms: [],
          pages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'church-services-1',
          name: 'Church Services',
          description: 'Comprehensive church management system for ministry, services, contributions, sacraments, and communications',
          projects: [],
          employees: [],
          intakeForms: [],
          pages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      defaultApps.forEach((defaultApp) => {
        if (!formattedData.find((a) => a.id === defaultApp.id)) {
          formattedData.push(defaultApp);
        }
      });
      setApplications(formattedData);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage or use defaults
      console.log('Custom applications load error (offline mode):', err);
      try {
        const stored = JSON.parse(localStorage.getItem('localCustomApplications') || '[]');
        if (stored.length > 0) {
          const formattedData: CustomApplication[] = stored.map((app: any) => ({
            id: app._id || app.id,
            name: app.name,
            description: app.description || '',
            projects: app.projects || [],
            employees: app.employees || [],
            intakeForms: app.intakeForms || [],
            pages: app.pages || [],
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
          }));
          // Merge with defaults
          const defaultApps = [
            {
              id: 'citizen-services-1',
              name: 'Citizen Services',
              description: 'Comprehensive citizen services intake system - Sample application for nonprofit organizations',
              projects: [],
              employees: [],
              intakeForms: [],
              pages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'fleet-management-1',
              name: 'Fleet Management',
              description: 'Complete fleet management system for vehicle operations, maintenance, compliance, and monitoring',
              projects: [],
              employees: [],
              intakeForms: [],
              pages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'church-services-1',
              name: 'Church Services',
              description: 'Comprehensive church management system for ministry, services, contributions, sacraments, and communications',
              projects: [],
              employees: [],
              intakeForms: [],
              pages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          defaultApps.forEach((defaultApp) => {
            if (!formattedData.find((a) => a.id === defaultApp.id)) {
              formattedData.push(defaultApp);
            }
          });
          setApplications(formattedData);
        } else {
          // Use defaults only
          setApplications([
            {
              id: 'citizen-services-1',
              name: 'Citizen Services',
              description: 'Comprehensive citizen services intake system - Sample application for nonprofit organizations',
              projects: [],
              employees: [],
              intakeForms: [],
              pages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'fleet-management-1',
              name: 'Fleet Management',
              description: 'Complete fleet management system for vehicle operations, maintenance, compliance, and monitoring',
              projects: [],
              employees: [],
              intakeForms: [],
              pages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'church-services-1',
              name: 'Church Services',
              description: 'Comprehensive church management system for ministry, services, contributions, sacraments, and communications',
              projects: [],
              employees: [],
              intakeForms: [],
              pages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (localErr) {
        // Use defaults on error
        setApplications([
          {
            id: 'citizen-services-1',
            name: 'Citizen Services',
            description: 'Comprehensive citizen services intake system - Sample application for nonprofit organizations',
            projects: [],
            employees: [],
            intakeForms: [],
            pages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'fleet-management-1',
            name: 'Fleet Management',
            description: 'Complete fleet management system for vehicle operations, maintenance, compliance, and monitoring',
            projects: [],
            employees: [],
            intakeForms: [],
            pages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'church-services-1',
            name: 'Church Services',
            description: 'Comprehensive church management system for ministry, services, contributions, sacraments, and communications',
            projects: [],
            employees: [],
            intakeForms: [],
            pages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
      setError(null); // Don't show error in offline mode
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (app?: CustomApplication) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        name: app.name,
        description: app.description,
      });
    } else {
      setEditingApp(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingApp(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Application name is required');
        return;
      }

      if (editingApp) {
        await customApplicationsApi.update(editingApp.id, formData);
      } else {
        await customApplicationsApi.create(formData);
      }
      handleCloseDialog();
      loadApplications();
    } catch (err: any) {
      // OFFLINE MODE: Don't show errors, operation succeeded in localStorage
      console.log('Save error (offline mode):', err);
      handleCloseDialog();
      loadApplications();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await customApplicationsApi.delete(id);
        loadApplications();
      } catch (err: any) {
        // OFFLINE MODE: Don't show errors, operation succeeded in localStorage
        console.log('Delete error (offline mode):', err);
        loadApplications();
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Custom Applications"
        subtitle="Manage applications that will be packaged and shipped to customers. These forms are generated in the Website Customization navigation."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading applications...</Typography>
      ) : applications.length === 0 ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No custom applications found
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Create Your First Application
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {applications.map((app) => (
            <Grid item xs={12} md={6} key={app.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">{app.name}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(app)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(app.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {app.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={`${app.projects.length} Projects`}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={`${app.employees.length} Employees`}
                      size="small"
                      color="secondary"
                    />
                    <Chip
                      label={`${app.intakeForms.length} Intake Forms`}
                      size="small"
                    />
                    <Chip
                      label={`${app.pages.length} Pages`}
                      size="small"
                      color="default"
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    fullWidth
                    onClick={() => {
                      // Navigate based on application ID
                      if (app.id === 'citizen-services-1') {
                        navigate('/custom-applications/citizen-services-1');
                      } else if (app.id === 'fleet-management-1') {
                        navigate('/custom-applications/fleet-management-1');
                      } else if (app.id === 'church-services-1') {
                        navigate('/custom-applications/church-services-1');
                      } else {
                        // Navigate to the customization detail page for other applications
                        navigate(`/website-customization/applications/${app.id}`);
                      }
                    }}
                  >
                    Customize Application
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingApp ? 'Edit Application' : 'Create Application'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Application Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingApp ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
