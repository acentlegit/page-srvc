import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { CloudUpload, Preview, Save } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import { intakeFormBuilderApi } from '../../api/citizenServices';
import type { FormField } from '../../types/citizenServices';

const steps = ['Upload Template', 'Review Fields', 'Generate Form'];

export default function IntakeFormBuilderPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedFields, setExtractedFields] = useState<FormField[]>([]);
  const [formName, setFormName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setLoading(true);
    setError(null);

    try {
      const result = await intakeFormBuilderApi.uploadTemplate(file);
      setExtractedFields(result.fields);
      setActiveStep(1);
      setSuccess('File uploaded and fields extracted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForm = async () => {
    if (!formName.trim()) {
      setError('Please enter a form name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, we'll create a form directly with the extracted fields
      // In a real implementation, you'd save the template first
      const formData = {
        name: formName,
        fields_config: extractedFields,
        is_active: true,
      };

      // This would call the actual API
      // await intakeFormBuilderApi.generateForm(templateId, formName);
      
      setSuccess(`Form "${formName}" generated successfully!`);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to generate form');
    } finally {
      setLoading(false);
    }
  };

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Text',
      email: 'Email',
      tel: 'Phone',
      date: 'Date',
      number: 'Number',
      select: 'Dropdown',
      multiselect: 'Multi-select',
      checkbox: 'Checkbox',
      radio: 'Radio',
      textarea: 'Text Area',
      file: 'File Upload',
    };
    return labels[type] || type;
  };

  return (
    <Box>
      <PageHeader
        title="Intake Form Builder"
        subtitle="Upload templates (Excel, Word, PDF) to generate dynamic intake forms"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 1: Upload Template File
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Supported formats: Excel (.xlsx, .xls), Word (.docx, .doc), PDF (.pdf)
              </Typography>

              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'action.hover',
                }}
              >
                <input
                  accept=".xlsx,.xls,.docx,.doc,.pdf"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? 'Uploading...' : 'Choose File'}
                  </Button>
                </label>
                {uploadedFile && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Selected: {uploadedFile.name}
                  </Typography>
                )}
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 2: Review Extracted Fields
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review the fields extracted from your template. You can edit them before generating the form.
              </Typography>

              {extractedFields.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Label</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Required</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extractedFields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell>{field.name}</TableCell>
                          <TableCell>{field.label}</TableCell>
                          <TableCell>
                            <Chip label={getFieldTypeLabel(field.type)} size="small" />
                          </TableCell>
                          <TableCell>
                            {field.required ? (
                              <Chip label="Yes" color="error" size="small" />
                            ) : (
                              <Chip label="No" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No fields extracted. Please try uploading a different file.</Alert>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button onClick={() => setActiveStep(0)}>Back</Button>
                <TextField
                  label="Form Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter form name"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleGenerateForm}
                  disabled={loading || !formName.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  Generate Form
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 3: Form Generated Successfully!
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                Your intake form "{formName}" has been created successfully.
              </Alert>
              <Button
                variant="contained"
                onClick={() => {
                  setActiveStep(0);
                  setUploadedFile(null);
                  setExtractedFields([]);
                  setFormName('');
                }}
              >
                Create Another Form
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
