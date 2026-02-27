import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, People } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import { projectsApi, customApplicationsApi, employeesApi } from '../../api/applicationCustomization';

interface Project {
  id: string;
  name: string;
  description: string;
  customApplicationId: string;
  customApplicationName?: string;
  employees: string[];
  pages: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectsPageProps {
  customApplicationId?: string;
}

export default function ProjectsPage({ customApplicationId }: ProjectsPageProps = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [customApplications, setCustomApplications] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customApplicationId: customApplicationId || '',
  });

  useEffect(() => {
    loadProjects();
    loadCustomApplications();
    loadEmployees();
  }, [customApplicationId]);

  const loadEmployees = async () => {
    try {
      const appId = customApplicationId || 'citizen-services-1';
      const data = await employeesApi.list(appId);
      setEmployees(data || []);
    } catch (err: any) {
      console.warn('Failed to load employees:', err);
      setEmployees([]);
    }
  };

  const loadCustomApplications = async () => {
    try {
      const data = await customApplicationsApi.list();
      const formatted = data.map((app: any) => ({
        id: app._id || app.id,
        name: app.name,
      }));
      // Always include Citizen Services for now
      if (!formatted.find((a: any) => a.name === 'Citizen Services')) {
        formatted.push({ id: 'citizen-services-1', name: 'Citizen Services' });
      }
      setCustomApplications(formatted);
    } catch (err: any) {
      console.error('Failed to load custom applications:', err);
      // Fallback to mock data
      setCustomApplications([
        { id: 'citizen-services-1', name: 'Citizen Services' },
      ]);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const appId = customApplicationId || formData.customApplicationId;
      const data = await projectsApi.list(appId || undefined);
      // Convert MongoDB _id to id and format data
      const formattedData: Project[] = data.map((proj: any) => ({
        id: proj._id || proj.id,
        name: proj.name,
        description: proj.description || '',
        customApplicationId: typeof proj.customApplicationId === 'object' 
          ? proj.customApplicationId._id 
          : proj.customApplicationId,
        customApplicationName: typeof proj.customApplicationId === 'object'
          ? proj.customApplicationId.name
          : undefined,
        employees: proj.employees || [],
        pages: proj.pages || [],
        createdAt: proj.createdAt,
        updatedAt: proj.updatedAt,
      }));
      setProjects(formattedData);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage instead
      console.log('API unavailable, loading from localStorage (offline mode)');
      try {
        const storedProjects = JSON.parse(localStorage.getItem('localProjects') || '[]');
        const filtered = customApplicationId 
          ? storedProjects.filter((p: any) => p.customApplicationId === customApplicationId)
          : storedProjects;
        setProjects(filtered);
        setError(null);
      } catch (localErr) {
        setProjects([]);
        setError(null); // Don't show error in offline mode
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        customApplicationId: project.customApplicationId,
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        customApplicationId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      customApplicationId: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Project name is required');
        return;
      }
      const appId = customApplicationId || formData.customApplicationId;
      if (!appId) {
        setError('Please select a custom application');
        return;
      }

      if (editingProject) {
        await projectsApi.update(editingProject.id, formData);
      } else {
        await projectsApi.create({
          ...formData,
          customApplicationId: appId,
        });
      }

      handleCloseDialog();
      loadProjects();
      loadEmployees(); // Reload employees to update counts
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsApi.delete(id);
        loadProjects();
      } catch (err: any) {
        setError(err.message || 'Failed to delete project');
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title={customApplicationId ? "Projects" : "All Projects"}
        subtitle={customApplicationId 
          ? "Create and manage projects within this custom application. Projects are part of the Website Customization system."
          : "Create and manage projects within custom applications. Projects are part of the Website Customization system."}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            disabled={customApplicationId ? false : !formData.customApplicationId}
          >
            Create Project
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mt: 2 }}>
        <CardContent>
          {loading ? (
            <Typography>Loading projects...</Typography>
          ) : projects.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects found
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Create Your First Project
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Custom Application</TableCell>
                    <TableCell>Employees</TableCell>
                    <TableCell>Pages</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => {
                    // Calculate actual employee count from employees that have this project in their projectIds
                    const employeeCount = employees.filter((emp) => 
                      (emp.projectIds || emp.projects || []).includes(project.id)
                    ).length;
                    
                    return (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{project.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {project.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.customApplicationName || 'Unknown'}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<People />}
                          label={`${employeeCount} employees`}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${project.pages.length} pages`}
                          size="small"
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(project)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(project.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'Create Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {!customApplicationId && (
              <FormControl fullWidth required>
                <InputLabel>Custom Application</InputLabel>
                <Select
                  value={formData.customApplicationId}
                  onChange={(e) =>
                    setFormData({ ...formData, customApplicationId: e.target.value })
                  }
                  label="Custom Application"
                >
                  {customApplications.map((app) => (
                    <MenuItem key={app.id} value={app.id}>
                      {app.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {customApplicationId && (
              <Typography variant="body2" color="text.secondary">
                Project will be created for: {customApplications.find(a => a.id === customApplicationId)?.name || 'Current Application'}
              </Typography>
            )}
            <TextField
              label="Project Name"
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
            <Typography variant="body2" color="text.secondary">
              Employees and pages can be managed after creation.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
