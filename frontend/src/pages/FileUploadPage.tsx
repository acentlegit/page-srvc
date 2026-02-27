import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  LinearProgress,
} from '@mui/material'
import { Upload, Delete, Image, VideoFile, Description, PictureAsPdf } from '@mui/icons-material'

interface UploadedFile {
  id: string
  file: File
  preview: string
  progress: number
  status: 'uploading' | 'success' | 'error'
}

export default function FileUploadPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const acceptedTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    videos: ['video/mp4', 'video/webm', 'video/ogg'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  }

  const getFileIcon = (file: File) => {
    if (acceptedTypes.images.includes(file.type)) return <Image />
    if (acceptedTypes.videos.includes(file.type)) return <VideoFile />
    if (file.type === 'application/pdf') return <PictureAsPdf />
    return <Description />
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const newFiles: UploadedFile[] = selectedFiles.map((file) => {
        const id = `${Date.now()}-${Math.random()}`
        let preview = ''
        
        if (acceptedTypes.images.includes(file.type)) {
          preview = URL.createObjectURL(file)
        }

        return {
          id,
          file,
          preview,
          progress: 0,
          status: 'uploading' as const,
        }
      })

      setFiles([...files, ...newFiles])
      setError('')

      // Simulate upload
      newFiles.forEach((fileObj) => {
        uploadFile(fileObj)
      })
    }
  }

  const uploadFile = async (fileObj: UploadedFile) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, progress } : f
        ))
      }

      // TODO: Implement actual API call
      // const formData = new FormData()
      // formData.append('file', fileObj.file)
      // formData.append('userId', user?.id || '')
      // formData.append('pageId', pageId || '')
      // await fileUploadApi.upload(formData)

      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f
      ))
      setSuccess('Files uploaded successfully!')
    } catch (err: any) {
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'error' } : f
      ))
      setError(err.message || 'Failed to upload file')
    }
  }

  const handleRemoveFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const handleClearAll = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: 20 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          File Upload
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload images, videos, and documents to share with staff and management
        </Typography>
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

      <Paper elevation={3} style={{ padding: 30, borderRadius: 12, marginBottom: 20 }}>
        <Box
          border="2px dashed"
          borderColor="grey.300"
          borderRadius={2}
          p={4}
          textAlign="center"
        >
          <input
            accept="image/*,video/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<Upload />}
              size="large"
              sx={{ mb: 2 }}
            >
              Select Files to Upload
            </Button>
          </label>
          <Typography variant="body2" color="text.secondary" display="block">
            Supported formats: Images (JPEG, PNG, GIF), Videos (MP4, WebM), Documents (PDF, DOC, DOCX)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Maximum file size: 50MB per file
          </Typography>
        </Box>
      </Paper>

      {files.length > 0 && (
        <Box mb={2} display="flex" justifyContent="flex-end">
          <Button variant="outlined" onClick={handleClearAll}>
            Clear All
          </Button>
        </Box>
      )}

      <Grid container spacing={2}>
        {files.map((fileObj) => (
          <Grid item xs={12} sm={6} md={4} key={fileObj.id}>
            <Card>
              {fileObj.preview ? (
                <Box
                  component="img"
                  src={fileObj.preview}
                  alt={fileObj.file.name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                  }}
                >
                  {getFileIcon(fileObj.file)}
                </Box>
              )}
              <CardContent>
                <Typography variant="body2" noWrap title={fileObj.file.name}>
                  {fileObj.file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(fileObj.file.size / 1024).toFixed(2)} KB
                </Typography>
                {fileObj.status === 'uploading' && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress variant="determinate" value={fileObj.progress} />
                    <Typography variant="caption" color="text.secondary">
                      {fileObj.progress}%
                    </Typography>
                  </Box>
                )}
                {fileObj.status === 'success' && (
                  <Typography variant="caption" color="success.main" display="block" mt={1}>
                    ✓ Uploaded
                  </Typography>
                )}
                {fileObj.status === 'error' && (
                  <Typography variant="caption" color="error.main" display="block" mt={1}>
                    ✗ Upload failed
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveFile(fileObj.id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
