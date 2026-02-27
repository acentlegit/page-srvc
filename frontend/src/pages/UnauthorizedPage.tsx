import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Paper, Typography, Button, Box } from '@mui/material'
import { Lock, Home } from '@mui/icons-material'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm" style={{ marginTop: '10vh' }}>
      <Paper elevation={3} style={{ padding: 40, borderRadius: 12, textAlign: 'center' }}>
        <Lock style={{ fontSize: 80, color: '#f44336', marginBottom: 20 }} />
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Please contact your administrator if you believe this is an error.
        </Typography>
        <Box mt={3} display="flex" gap={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
