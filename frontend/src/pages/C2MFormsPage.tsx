import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { Upload, Description, Send } from '@mui/icons-material'

interface FormData {
  title: string
  description: string
  category: string
  pdfFile: File | null
}

export default function C2MFormsPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    pdfFile: null,
  })
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (field === 'pdfFile' && e.target instanceof HTMLInputElement && e.target.files) {
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
        setFormData({ ...formData, pdfFile: file })
        setPdfPreview(URL.createObjectURL(file))
        setError('')
      }
    } else {
      setFormData({ ...formData, [field]: e.target.value })
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // TODO: Implement API call to submit form
      // const formSubmission = {
      //   title: formData.title,
      //   description: formData.description,
      //   category: formData.category,
      //   customerId: user?.id,
      //   customerEmail: user?.email,
      //   pdfFile: formData.pdfFile,
      // }
      // await c2mFormsApi.submit(formSubmission)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSuccess('Form submitted successfully! Your submission has been sent to management.')
      setFormData({
        title: '',
        description: '',
        category: '',
        pdfFile: null,
      })
      setPdfPreview(null)
    } catch (err: any) {
      setError(err.message || 'Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" style={{ marginTop: 20 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Customer-to-Management (C2M) Form
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Submit forms and upload PDFs to communicate with management
        </Typography>
      </Box>

      <Paper elevation={3} style={{ padding: 30, borderRadius: 12 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Form Title"
                value={formData.title}
                onChange={handleChange('title')}
                required
                placeholder="e.g., Request for Information, Complaint, Suggestion"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={handleChange('category')}
                placeholder="e.g., General Inquiry, Technical Issue, Billing"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                required
                multiline
                rows={6}
                placeholder="Please provide detailed information about your request, issue, or suggestion..."
              />
            </Grid>

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
                  onChange={handleChange('pdfFile')}
                />
                <label htmlFor="pdf-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    sx={{ mb: 2 }}
                  >
                    Upload PDF Document
                  </Button>
                </label>
                {formData.pdfFile && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Selected: {formData.pdfFile.name} ({(formData.pdfFile.size / 1024).toFixed(2)} KB)
                    </Typography>
                    {pdfPreview && (
                      <Button
                        size="small"
                        startIcon={<Description />}
                        onClick={() => window.open(pdfPreview, '_blank')}
                        sx={{ mt: 1 }}
                      >
                        Preview PDF
                      </Button>
                    )}
                  </Box>
                )}
                <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                  Maximum file size: 10MB. PDF files only.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<Send />}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Submitting...' : 'Submit Form'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Box mt={3}>
        <Paper elevation={1} style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Form Submission Guidelines:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>Provide clear and detailed information in your description</li>
              <li>Upload relevant PDF documents if applicable</li>
              <li>Your submission will be reviewed by management and assigned staff</li>
              <li>You will receive updates on your submission status</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
