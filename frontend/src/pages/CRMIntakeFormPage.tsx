import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { crmApi } from '../api/crm'
import { usersApi } from '../api/apiClient'
import { pagesApi } from '../api/apiClient'
import { activityTracking, getCurrentUserInfo, createActivityDescription } from '../api/activityTracking'
import jsPDF from 'jspdf'
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
  CircularProgress,
} from '@mui/material'
import { Upload, LocationOn, Send, Description, Download } from '@mui/icons-material'

interface IntakeFormData {
  firstName: string
  lastName: string
  middleName: string
  email: string
  phone: string
  userType: 'beam' | 'non-beam'
  beamUserId: string
  location: {
    address: string
    city: string
    state: string
    country: string
    zip: string
  }
  uploadedPDF: File | null
  additionalInfo: string
}

export default function CRMIntakeFormPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pageId = searchParams.get('pageId') || ''

  const [formData, setFormData] = useState<IntakeFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    userType: 'non-beam',
    beamUserId: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      zip: '',
    },
    uploadedPDF: null,
    additionalInfo: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null)

  // Generate PDF from form data
  const generatePDF = (data: IntakeFormData): string => {
    const doc = new jsPDF()
    let yPos = 20

    // Title
    doc.setFontSize(18)
    doc.text('Intake Form', 105, yPos, { align: 'center' })
    yPos += 15

    // Personal Information Section
    doc.setFontSize(14)
    doc.text('Personal Information', 14, yPos)
    yPos += 8

    doc.setFontSize(11)
    doc.text(`First Name: ${data.firstName}`, 14, yPos)
    yPos += 7

    if (data.middleName) {
      doc.text(`Middle Name: ${data.middleName}`, 14, yPos)
      yPos += 7
    }

    doc.text(`Last Name: ${data.lastName}`, 14, yPos)
    yPos += 7
    doc.text(`Email: ${data.email}`, 14, yPos)
    yPos += 7
    doc.text(`Phone: ${data.phone}`, 14, yPos)
    yPos += 10

    // User Type Section
    doc.setFontSize(14)
    doc.text('User Type', 14, yPos)
    yPos += 8

    doc.setFontSize(11)
    doc.text(`Type: ${data.userType === 'beam' ? 'Beam User' : 'Non-Beam User'}`, 14, yPos)
    yPos += 7

    if (data.userType === 'beam' && data.beamUserId) {
      doc.text(`Beam User ID: ${data.beamUserId}`, 14, yPos)
      yPos += 7
    }

    yPos += 5

    // Location Section
    doc.setFontSize(14)
    doc.text('Location Information', 14, yPos)
    yPos += 8

    doc.setFontSize(11)
    if (data.location.address) {
      doc.text(`Address: ${data.location.address}`, 14, yPos)
      yPos += 7
    }
    if (data.location.city) {
      doc.text(`City: ${data.location.city}`, 14, yPos)
      yPos += 7
    }
    if (data.location.state) {
      doc.text(`State: ${data.location.state}`, 14, yPos)
      yPos += 7
    }
    if (data.location.country) {
      doc.text(`Country: ${data.location.country}`, 14, yPos)
      yPos += 7
    }
    if (data.location.zip) {
      doc.text(`ZIP Code: ${data.location.zip}`, 14, yPos)
      yPos += 7
    }

    yPos += 5

    // Additional Information
    if (data.additionalInfo) {
      doc.setFontSize(14)
      doc.text('Additional Information', 14, yPos)
      yPos += 8

      doc.setFontSize(11)
      const splitText = doc.splitTextToSize(data.additionalInfo, 180)
      doc.text(splitText, 14, yPos)
      yPos += splitText.length * 7 + 5
    }

    // Submission Date
    doc.setFontSize(10)
    doc.text(`Submitted on: ${new Date().toLocaleString()}`, 14, yPos + 10)

    // Generate PDF as base64
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    return pdfUrl
  }

  const handleChange = (field: keyof IntakeFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (field === 'uploadedPDF' && e.target instanceof HTMLInputElement && e.target.files) {
      const file = e.target.files[0]
      if (file) {
        if (file.type !== 'application/pdf') {
          setError('Please upload a PDF file only')
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          setError('PDF file size must be less than 10MB')
          return
        }
        setFormData({ ...formData, uploadedPDF: file })
        setError('')
      }
    } else if (field === 'location') {
      const locationField = (e.target as HTMLInputElement).name.split('.')[1] as keyof IntakeFormData['location']
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: e.target.value,
        },
      })
    } else {
      setFormData({ ...formData, [field]: e.target.value })
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields (First Name, Last Name, Email, Phone)')
      setLoading(false)
      return
    }

    if (formData.userType === 'beam' && !formData.beamUserId) {
      setError('Please enter Beam User ID for Beam users')
      setLoading(false)
      return
    }

    try {
      // Step 1: Generate PDF from form data
      const pdfUrl = generatePDF(formData)
      setGeneratedPdfUrl(pdfUrl)

      // Convert PDF to base64 for storage
      const pdfBlob = await fetch(pdfUrl).then((r) => r.blob())
      const reader = new FileReader()
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(pdfBlob)
      })

      // Step 2: Create user account
      let userId: string
      let customId: string

      if (formData.userType === 'beam') {
        // Beam user - use provided Beam user ID
        userId = formData.beamUserId
        customId = formData.beamUserId
      } else {
        // Non-Beam user - generate custom ID
        customId = `CUSTOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        userId = customId
      }

      // Create user via API
      try {
        const newUser = await usersApi.create({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: 'customer',
          customId: customId,
          blocked: 'OFF',
          beamId: formData.userType === 'beam' ? formData.beamUserId : '',
          status: 'active',
        })

        userId = newUser.id || userId
      } catch (userErr: any) {
        // If user creation fails, continue with generated ID
        console.warn('User creation failed, using generated ID:', userErr)
      }

      // Step 3: Create lead
      const leadName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim()
      
      const lead = await crmApi.createLead({
        name: leadName,
        email: formData.email,
        phone: formData.phone,
        company: formData.location.city || '',
        status: 'NEW',
        notes: `User Type: ${formData.userType === 'beam' ? 'Beam User' : 'Non-Beam User'}\n${formData.additionalInfo || ''}`,
      })

      // Step 4: Store PDF in page (if pageId provided)
      if (pageId) {
        try {
          const pagePDFs = JSON.parse(localStorage.getItem(`pagePDFs_${pageId}`) || '[]')
          pagePDFs.push({
            id: `pdf_${Date.now()}`,
            formData: formData,
            pdfBase64: pdfBase64,
            leadId: lead.id,
            userId: userId,
            createdAt: new Date().toISOString(),
          })
          localStorage.setItem(`pagePDFs_${pageId}`, JSON.stringify(pagePDFs))

          // Also store in intake forms
          const intakeForms = JSON.parse(localStorage.getItem(`crmIntakeForms_${pageId}`) || '[]')
          intakeForms.push({
            id: `intake_${Date.now()}`,
            formData: formData,
            pdfBase64: pdfBase64,
            leadId: lead.id,
            userId: userId,
            customId: customId,
            userType: formData.userType,
            createdAt: new Date().toISOString(),
          })
          localStorage.setItem(`crmIntakeForms_${pageId}`, JSON.stringify(intakeForms))

          // Add user to page members if page exists
          try {
            const page = await pagesApi.get(pageId)
            if (page && page.members) {
              const updatedMembers = [
                ...page.members,
                {
                  userId: userId,
                  email: formData.email,
                  name: leadName,
                },
              ]
              await pagesApi.update(pageId, {
                members: updatedMembers,
              })
            }
          } catch (pageErr) {
            console.warn('Failed to add user to page:', pageErr)
          }
        } catch (storageErr) {
          console.warn('Failed to store PDF in page:', storageErr)
        }
      }

      // Step 5: Handle uploaded PDF if provided
      if (formData.uploadedPDF) {
        const uploadedPdfBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(formData.uploadedPDF!)
        })

        // Store uploaded PDF
        if (pageId) {
          const pagePDFs = JSON.parse(localStorage.getItem(`pagePDFs_${pageId}`) || '[]')
          pagePDFs.push({
            id: `uploaded_pdf_${Date.now()}`,
            fileName: formData.uploadedPDF.name,
            pdfBase64: uploadedPdfBase64,
            leadId: lead.id,
            userId: userId,
            uploaded: true,
            createdAt: new Date().toISOString(),
          })
          localStorage.setItem(`pagePDFs_${pageId}`, JSON.stringify(pagePDFs))
        }
      }

      // Log activity
      const userInfo = getCurrentUserInfo()
      const activity = activityTracking.log({
        type: 'lead',
        entityId: lead.id,
        entityName: leadName,
        action: 'created',
        userId: userInfo.id,
        userName: userInfo.name,
        description: `Intake form submitted for ${leadName} (${formData.userType === 'beam' ? 'Beam User' : 'Non-Beam User'})`,
      })
      
      console.log('✅ Lead created:', lead)
      console.log('✅ Activity logged:', activity)
      console.log('✅ PDF generated:', pdfBase64 ? 'Yes' : 'No')
      console.log('✅ User created with ID:', userId)
      console.log('✅ Custom ID:', customId)

      setSuccess(
        `Form submitted successfully! ${formData.userType === 'beam' ? 'Beam User ID: ' + formData.beamUserId : 'Custom ID: ' + customId}\n\n` +
        `✅ Lead created: ${lead.id}\n` +
        `✅ Check: Management → Leads\n` +
        `✅ Check: Management → Activity Feed`
      )

      // Reset form after 10 seconds, but keep PDF URL so user can download
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          email: '',
          phone: '',
          userType: 'non-beam',
          beamUserId: '',
          location: {
            address: '',
            city: '',
            state: '',
            country: '',
            zip: '',
          },
          uploadedPDF: null,
          additionalInfo: '',
        })
        // Don't clear PDF URL - keep it so user can download anytime
        // setGeneratedPdfUrl(null)
        setSuccess('')
      }, 10000)
    } catch (err: any) {
      console.error('Failed to submit intake form:', err)
      setError(err.message || 'Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper elevation={3} style={{ padding: 30, borderRadius: 12 }}>
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Intake Form
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submit your information to be added to the system. All information will be automatically converted to PDF.
          </Typography>
          {pageId && (
            <Typography variant="body2" color="primary" style={{ marginTop: 8 }}>
              Submitting to Page ID: {pageId}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.middleName}
                onChange={handleChange('middleName')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone *"
                type="tel"
                value={formData.phone}
                onChange={handleChange('phone')}
                required
              />
            </Grid>

            {/* User Type */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">User Type *</FormLabel>
                <RadioGroup
                  row
                  value={formData.userType}
                  onChange={(e) =>
                    setFormData({ ...formData, userType: e.target.value as 'beam' | 'non-beam' })
                  }
                >
                  <FormControlLabel value="beam" control={<Radio />} label="Beam User" />
                  <FormControlLabel value="non-beam" control={<Radio />} label="Non-Beam User" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {formData.userType === 'beam' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Beam User ID *"
                  value={formData.beamUserId}
                  onChange={handleChange('beamUserId')}
                  required
                  helperText="Enter your Beam user ID (temporary or permanent)"
                />
              </Grid>
            )}

            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange('location')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange('location')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange('location')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange('location')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="location.zip"
                value={formData.location.zip}
                onChange={handleChange('location')}
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Information"
                value={formData.additionalInfo}
                onChange={handleChange('additionalInfo')}
                multiline
                rows={4}
                placeholder="Any additional information you'd like to provide..."
              />
            </Grid>

            {/* PDF Upload */}
            <Grid item xs={12}>
              <Box
                border="2px dashed"
                borderColor="grey.300"
                borderRadius={2}
                p={3}
                textAlign="center"
              >
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="pdf-upload"
                  type="file"
                  onChange={handleChange('uploadedPDF')}
                />
                <label htmlFor="pdf-upload">
                  <Button variant="outlined" component="span" startIcon={<Upload />} sx={{ mb: 2 }}>
                    Upload PDF Document (Optional)
                  </Button>
                </label>
                {formData.uploadedPDF && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Selected: {formData.uploadedPDF.name} ({(formData.uploadedPDF.size / 1024).toFixed(2)} KB)
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                  Maximum file size: 10MB. PDF files only.
                </Typography>
              </Box>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Submitting...' : 'Submit Intake Form'}
              </Button>
            </Grid>

            {generatedPdfUrl && (
              <Grid item xs={12}>
                <Alert 
                  severity="success" 
                  style={{ marginTop: 16 }}
                  onClose={() => {
                    // Don't clear PDF URL when user closes alert - keep buttons available
                  }}
                >
                  <Box>
                    <Typography variant="body2" style={{ marginBottom: 12, fontWeight: 500 }}>
                      ✅ PDF generated successfully! You can view or download it anytime.
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Description />}
                        onClick={() => window.open(generatedPdfUrl, '_blank')}
                      >
                        View PDF
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = generatedPdfUrl
                          const firstName = formData.firstName || 'User'
                          const lastName = formData.lastName || 'Form'
                          const date = new Date().toISOString().split('T')[0]
                          link.download = `IntakeForm_${firstName}_${lastName}_${date}.pdf`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        style={{ background: 'var(--brand)', color: '#fff' }}
                      >
                        Download PDF
                      </Button>
                    </Box>
                  </Box>
                </Alert>
              </Grid>
            )}
          </Grid>
        </form>

        <Box mt={3}>
          <Paper elevation={1} style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Form Submission Information:
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>All information will be automatically converted to PDF</li>
                <li>PDF will be stored in the page and system</li>
                <li>Your account will be created based on user type</li>
                <li>Beam users: Use your Beam User ID</li>
                <li>Non-Beam users: System will generate a custom ID</li>
                <li>You will be added to the page as a member</li>
              </ul>
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Container>
  )
}
