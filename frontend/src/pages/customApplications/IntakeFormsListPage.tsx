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
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit, Delete, Visibility, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { intakeFormBuilderApi } from '../../api/citizenServices';
import type { IntakeForm } from '../../types/citizenServices';

export default function IntakeFormsListPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<IntakeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await intakeFormBuilderApi.listForms();
      setForms(data);
    } catch (err: any) {
      // Only show error if it's not a 404 or connection error (backend not available)
      if (err.status !== 404 && !err.message?.includes('404') && !err.message?.includes('Failed to fetch') && !err.message?.includes('NetworkError')) {
        setError(err.message || 'Failed to load forms');
      } else {
        // Backend not available - show empty state (no error message)
        setForms([]);
        setError(null); // Don't show error for connection issues
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await intakeFormBuilderApi.deleteForm(id);
        loadForms();
      } catch (err: any) {
        // OFFLINE MODE: Don't show errors
        console.log('Delete error (offline mode):', err);
        loadForms();
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Intake Forms"
        subtitle="Manage all intake forms"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/custom-applications/citizen-services-1/intake-form-builder')}
          >
            Create New Form
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
            <Typography>Loading forms...</Typography>
          ) : forms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No intake forms found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fill out the intake form with all 9 steps to submit your information.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/custom-applications/citizen-services-1/intake-forms/new')}
                sx={{ mt: 2 }}
              >
                Fill Intake Form (View All 9 Steps)
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Form Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Fields</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{form.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {form.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>{form.fields_config?.length || 0} fields</TableCell>
                      <TableCell>
                        <Chip
                          label={form.is_active ? 'Active' : 'Inactive'}
                          color={form.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(form.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/custom-applications/citizen-services-1/intake-forms/${form.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/custom-applications/citizen-services-1/intake-forms/${form.id}/edit`)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(form.id)}
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
    </Box>
  );
}
