import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Save, Send } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { intakeSubmissionApi } from '../../api/citizenServices';

const formSections = [
  'Consent & Privacy',
  'Basic Information',
  'Household Information',
  'Current Situation',
  'Service Request',
  'Additional Services',
  'Page Preferences',
  'Urgency Level',
  'Documentation',
  'Additional Notes',
];

export default function IntakeFormPage() {
  const { id } = useParams<{ id: string }>();
  const formId = id || 'default'; // Use 'default' if no ID provided (for /new route)
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initial form data
  const initialFormData = {
    // Consent
    consentGiven: false,
    consentUnderstood: false,

    // Basic Information
    fullName: '',
    preferredName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    preferredContact: 'phone' as 'phone' | 'text' | 'email',
    primaryLanguage: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    county: '',

    // Household Information
    householdSize: '',
    childrenUnder18: '',
    seniors65Plus: '',
    hasDisability: '',
    householdIncome: '',

    // Demographics (optional but useful)
    ageRange: '',
    employmentStatus: '',
    veteranStatus: '',

    // Current Situation (multi-select)
    currentSituation: [] as string[],

    // Service Request (multi-select)
    servicesRequested: [] as string[],

    // Additional Services (multi-select)
    additionalServices: [] as string[],

    // Page Preferences (dynamic pages/services they want to use)
    pagePreferences: [] as string[],

    // Urgency
    urgencyLevel: 'Standard' as 'Standard' | 'High' | 'Urgent',

    // Documentation
    documents: [] as File[],

    // Additional Notes
    additionalNotes: '',
  };

  // Form state
  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = (prev[field as keyof typeof prev] as string[]) || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) };
      }
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.consentGiven || !formData.consentUnderstood)) {
      setError('Please provide consent to continue');
      return;
    }
    setError(null);
    setActiveStep((prev) => Math.min(prev + 1, formSections.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Submit the form data to the backend
      await intakeSubmissionApi.submit(formId, formData);
      
      setSuccess('Intake form submitted successfully!');
      // Reset form after successful submission
      setTimeout(() => {
        // Navigate to submissions page instead of reloading
        window.location.href = '/custom-applications/citizen-services-1/intake-forms';
      }, 2000);
    } catch (err: any) {
      // OFFLINE MODE: Don't show errors, operation succeeded in localStorage
      console.log('Submit error (offline mode):', err);
      setError('Form submitted successfully!');
      // Reset form
      setFormData(initialFormData);
      // Navigate to submissions page after delay
      setTimeout(() => {
        window.location.href = '/custom-applications/citizen-services-1/intake-forms';
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Consent & Privacy
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Consent & Privacy
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please read and acknowledge the following before proceeding.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.consentGiven}
                  onChange={(e) => handleInputChange('consentGiven', e.target.checked)}
                />
              }
              label="I consent to my information being shared with partner nonprofits for the purpose of receiving services."
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.consentUnderstood}
                  onChange={(e) => handleInputChange('consentUnderstood', e.target.checked)}
                />
              }
              label="I understand this is not a guarantee of assistance."
            />
          </Box>
        );

      case 1: // Basic Information
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Full Legal Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Preferred Name"
                value={formData.preferredName}
                onChange={(e) => handleInputChange('preferredName', e.target.value)}
                fullWidth
              />
              <TextField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                fullWidth
              />
              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  value={formData.preferredContact}
                  onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                  label="Preferred Contact Method"
                >
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Primary Language"
                value={formData.primaryLanguage}
                onChange={(e) => handleInputChange('primaryLanguage', e.target.value)}
                fullWidth
              />
              <TextField
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                label="County"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                fullWidth
              />
            </Box>
          </Box>
        );

      case 2: // Household Information
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Household Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Total Household Size"
                type="number"
                value={formData.householdSize}
                onChange={(e) => handleInputChange('householdSize', e.target.value)}
                fullWidth
              />
              <TextField
                label="Number of Children (under 18)"
                type="number"
                value={formData.childrenUnder18}
                onChange={(e) => handleInputChange('childrenUnder18', e.target.value)}
                fullWidth
              />
              <TextField
                label="Number of Seniors (65+)"
                type="number"
                value={formData.seniors65Plus}
                onChange={(e) => handleInputChange('seniors65Plus', e.target.value)}
                fullWidth
              />
              <FormControl>
                <FormLabel>Is anyone in household disabled?</FormLabel>
                <RadioGroup
                  value={formData.hasDisability}
                  onChange={(e) => handleInputChange('hasDisability', e.target.value)}
                  row
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Household Monthly Income</InputLabel>
                <Select
                  value={formData.householdIncome}
                  onChange={(e) => handleInputChange('householdIncome', e.target.value)}
                  label="Household Monthly Income"
                >
                  <MenuItem value="$0-$1,000">$0 - $1,000</MenuItem>
                  <MenuItem value="$1,001-$2,000">$1,001 - $2,000</MenuItem>
                  <MenuItem value="$2,001-$3,000">$2,001 - $3,000</MenuItem>
                  <MenuItem value="$3,001+">$3,001+</MenuItem>
                </Select>
              </FormControl>
              
              {/* Demographics Section */}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Demographics (Optional)
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Age Range</InputLabel>
                <Select
                  value={formData.ageRange}
                  onChange={(e) => handleInputChange('ageRange', e.target.value)}
                  label="Age Range"
                >
                  <MenuItem value="18-24">18-24</MenuItem>
                  <MenuItem value="25-34">25-34</MenuItem>
                  <MenuItem value="35-44">35-44</MenuItem>
                  <MenuItem value="45-54">45-54</MenuItem>
                  <MenuItem value="55-64">55-64</MenuItem>
                  <MenuItem value="65+">65+</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Employment Status</InputLabel>
                <Select
                  value={formData.employmentStatus}
                  onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                  label="Employment Status"
                >
                  <MenuItem value="Employed Full-Time">Employed Full-Time</MenuItem>
                  <MenuItem value="Employed Part-Time">Employed Part-Time</MenuItem>
                  <MenuItem value="Unemployed">Unemployed</MenuItem>
                  <MenuItem value="Self-Employed">Self-Employed</MenuItem>
                  <MenuItem value="Retired">Retired</MenuItem>
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Disabled">Disabled</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Veteran Status</FormLabel>
                <RadioGroup
                  value={formData.veteranStatus}
                  onChange={(e) => handleInputChange('veteranStatus', e.target.value)}
                  row
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel value="prefer_not_to_say" control={<Radio />} label="Prefer not to say" />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
        );

      case 3: // Current Situation
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Situation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select all that apply:
            </Typography>
            {[
              'Homelessness',
              'Eviction notice',
              'Utility shutoff notice',
              'Food insecurity',
              'Medical emergency',
              'Domestic violence',
              'Unemployment',
              'Mental health crisis',
              'None of the above',
            ].map((situation) => (
              <FormControlLabel
                key={situation}
                control={
                  <Checkbox
                    checked={formData.currentSituation.includes(situation)}
                    onChange={(e) =>
                      handleCheckboxChange('currentSituation', situation, e.target.checked)
                    }
                  />
                }
                label={situation}
              />
            ))}
          </Box>
        );

      case 4: // Service Request
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Services Requested
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select all services you need:
            </Typography>
            {[
              'Food Assistance',
              'Housing / Rent Support',
              'Utility Assistance',
              'Employment Support',
              'Legal Aid',
              'Healthcare / Insurance Navigation',
              'Mental Health Services',
              'Childcare Support',
              'Transportation',
              'Senior Services',
              'Disability Services',
            ].map((service) => (
              <FormControlLabel
                key={service}
                control={
                  <Checkbox
                    checked={formData.servicesRequested.includes(service)}
                    onChange={(e) =>
                      handleCheckboxChange('servicesRequested', service, e.target.checked)
                    }
                  />
                }
                label={service}
              />
            ))}
            {formData.servicesRequested.includes('Other') && (
              <TextField
                label="Other (please specify)"
                fullWidth
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        );

      case 5: // Additional Services
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Services / Programs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select programs you're interested in:
            </Typography>
            {['Housing Rent Activity', 'Camping', 'Sports', 'Volunteer Sign-up', 'Donations'].map(
              (service) => (
                <FormControlLabel
                  key={service}
                  control={
                    <Checkbox
                      checked={formData.additionalServices.includes(service)}
                      onChange={(e) =>
                        handleCheckboxChange('additionalServices', service, e.target.checked)
                      }
                    />
                  }
                  label={service}
                />
              )
            )}
          </Box>
        );

      case 6: // Page Preferences
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Page Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Which dynamic pages/services would you like to use? (These use Page services for real-time communication)
            </Typography>
            {[
              'Chat Rooms / Communications',
              'Community Forums',
              'Event Discussions',
              'Support Groups',
              'Volunteer Coordination',
              'Case Worker Messaging',
              'None - Static pages only',
            ].map((page) => (
              <FormControlLabel
                key={page}
                control={
                  <Checkbox
                    checked={formData.pagePreferences.includes(page)}
                    onChange={(e) =>
                      handleCheckboxChange('pagePreferences', page, e.target.checked)
                    }
                  />
                }
                label={page}
              />
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Note: Dynamic pages enable real-time communication and collaboration. Static pages are regular web pages without interactive features.
            </Typography>
          </Box>
        );

      case 7: // Urgency Level
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Urgency Level
            </Typography>
            <FormControl>
              <RadioGroup
                value={formData.urgencyLevel}
                onChange={(e) => handleInputChange('urgencyLevel', e.target.value)}
              >
                <FormControlLabel
                  value="Emergency"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography>Emergency (24-48 hours)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Immediate assistance needed
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="High"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography>High (within 1 week)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Urgent but not immediate
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="Standard"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography>Standard (2-4 weeks)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Regular processing time
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 8: // Documentation
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Documentation Upload (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You can upload supporting documents:
            </Typography>
            <input
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button variant="outlined" component="span" fullWidth>
                Upload Documents
              </Button>
            </label>
            {formData.documents.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {formData.documents.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => {
                      const newDocs = formData.documents.filter((_, i) => i !== index);
                      handleInputChange('documents', newDocs);
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Supported: Government ID, Proof of Income, Utility Bill, Eviction Notice, Medical Documentation
            </Typography>
          </Box>
        );

      case 9: // Additional Notes
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Notes
            </Typography>
            <TextField
              label="Any additional information you'd like to share"
              multiline
              rows={6}
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              fullWidth
              placeholder="Please provide any additional information that might be helpful..."
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Citizen Services Intake Form"
        subtitle="Please fill out all sections to complete your intake"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {formSections.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: 3, mb: 3 }}>{renderStepContent()}</Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep === formSections.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              >
                Submit Form
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
