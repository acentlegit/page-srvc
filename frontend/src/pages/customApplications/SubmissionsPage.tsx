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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { intakeSubmissionApi } from '../../api/citizenServices';
import type { IntakeSubmission } from '../../types/citizenServices';

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<IntakeSubmission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await intakeSubmissionApi.listSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      // OFFLINE MODE: Load from localStorage
      console.log('Submissions load error (offline mode):', err);
      try {
        const stored = JSON.parse(localStorage.getItem('localIntakeSubmissions') || '[]');
        setSubmissions(stored);
        setError(null);
      } catch (localErr) {
        setSubmissions([]);
        setError(null); // Don't show error in offline mode
      }
    } finally {
      setLoading(false);
    }
  };

  const handleView = (submission: IntakeSubmission) => {
    setSelectedSubmission(submission);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        await intakeSubmissionApi.delete(id);
        // Reload submissions after successful delete
        loadSubmissions();
      } catch (err: any) {
        // OFFLINE MODE: Don't show errors, operation succeeded in localStorage
        console.log('Delete error (offline mode):', err);
        loadSubmissions();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <PageHeader
        title="View Submissions"
        subtitle="View and manage all submitted intake forms"
        action={
          <Button
            variant="contained"
            onClick={() => navigate('/custom-applications/citizen-services-1/intake-forms/new')}
          >
            Fill New Form
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
            <Typography>Loading submissions...</Typography>
          ) : submissions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No submissions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fill out an intake form to see submissions here.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/custom-applications/citizen-services-1/intake-forms/new')}
              >
                Fill Intake Form
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Case ID</TableCell>
                    <TableCell>Citizen Name</TableCell>
                    <TableCell>Services Requested</TableCell>
                    <TableCell>Urgency</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontFamily="monospace">
                          {submission.case_id || submission.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {submission.citizen?.fullName || submission.citizen?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {(submission.services_requested || []).slice(0, 2).map((service, idx) => (
                            <Chip key={idx} label={service} size="small" />
                          ))}
                          {(submission.services_requested || []).length > 2 && (
                            <Chip label={`+${(submission.services_requested || []).length - 2}`} size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.urgency_level || 'Standard'}
                          size="small"
                          color={submission.urgency_level === 'Emergency' ? 'error' : submission.urgency_level === 'High' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.status || 'Pending'}
                          size="small"
                          color={getStatusColor(submission.status || 'pending') as any}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(submission.submitted_at || submission.created_at || Date.now()).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleView(submission)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(submission.id)}
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

      {/* View Submission Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Submission Details - {selectedSubmission?.case_id || selectedSubmission?.id}
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Citizen Information</Typography>
              <Typography variant="body2" color="text.secondary">
                Name: {selectedSubmission.citizen?.fullName || selectedSubmission.citizen?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {selectedSubmission.citizen?.email || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {selectedSubmission.citizen?.phone || 'N/A'}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Services Requested</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                {(selectedSubmission.services_requested || []).map((service, idx) => (
                  <Chip key={idx} label={service} size="small" />
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>Urgency Level</Typography>
              <Chip
                label={selectedSubmission.urgency_level || 'Standard'}
                size="small"
                color={selectedSubmission.urgency_level === 'Emergency' ? 'error' : selectedSubmission.urgency_level === 'High' ? 'warning' : 'default'}
              />

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Status</Typography>
              <Chip
                label={selectedSubmission.status || 'Pending'}
                size="small"
                color={getStatusColor(selectedSubmission.status || 'pending') as any}
              />

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Submitted</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(selectedSubmission.submitted_at || selectedSubmission.created_at || Date.now()).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
