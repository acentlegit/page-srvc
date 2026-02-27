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
import { Add, Edit, Delete, Email, Phone, Work } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import { employeesApi, projectsApi } from '../../api/applicationCustomization';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  customApplicationId: string;
  projects?: string[];
  projectIds?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
}

export default function CitizenServicesEmployeesPage() {
  const customApplicationId = 'citizen-services-1';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    projects: [] as string[],
  });

  useEffect(() => {
    loadEmployees();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.list(customApplicationId);
      const formatted = (data || []).map((proj: any) => ({
        id: proj._id || proj.id,
        name: proj.name,
      }));
      setProjects(formatted);
      console.log('Loaded projects for', customApplicationId, ':', formatted);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setProjects([]);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeesApi.list(customApplicationId);
      setEmployees(data);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage instead
      console.log('API unavailable, loading from localStorage (offline mode)');
      try {
        const storedEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
        const filtered = customApplicationId 
          ? storedEmployees.filter((e: any) => e.customApplicationId === customApplicationId)
          : storedEmployees;
        setEmployees(filtered);
        setError(null);
      } catch (localErr) {
        setEmployees([]);
        setError(null); // Don't show error in offline mode
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (employee?: Employee) => {
    // Ensure projects are loaded before opening dialog
    await loadProjects();
    
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        projects: employee.projectIds || employee.projects || [],
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'employee',
        projects: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      projects: [],
    });
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Name and Email are required');
        return;
      }

      if (editingEmployee) {
        await employeesApi.update(editingEmployee.id, formData);
      } else {
        await employeesApi.create({
          ...formData,
          customApplicationId,
        });
      }

      handleCloseDialog();
      loadEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeesApi.delete(id);
        loadEmployees();
      } catch (err: any) {
        setError(err.message || 'Failed to delete employee');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'employee':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Employees"
        subtitle="Manage employees for Citizen Services"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Employee
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
            <Typography>Loading employees...</Typography>
          ) : employees.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No employees found
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Add Your First Employee
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Projects</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{employee.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">{employee.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {employee.phone ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">{employee.phone}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No phone
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.role}
                          size="small"
                          color={getRoleColor(employee.role) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Work />}
                          label={`${employee.projects?.length || 0} projects`}
                          size="small"
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(employee)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(employee.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add Employee'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as string })}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assigned Projects</InputLabel>
              <Select
                multiple
                value={formData.projects}
                label="Assigned Projects"
                onChange={(e) => setFormData({ ...formData, projects: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((projectId) => {
                      const project = projects.find((p) => p.id === projectId);
                      return (
                        <Chip key={projectId} label={project?.name || projectId} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {projects.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No projects available. Create projects first to assign them to employees.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEmployee ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
