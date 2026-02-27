import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, CustomerSignupData, UserRole } from '../contexts/AuthContext'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Visibility, VisibilityOff, Person, Email, Phone, Badge, Description, AdminPanelSettings, Groups, PersonAdd } from '@mui/icons-material'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState<CustomerSignupData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    customerId: '',
    purpose: '',
    password: '',
    role: 'customer',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof CustomerSignupData | 'confirmPassword') => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(e.target.value)
    } else {
      setFormData({ ...formData, [field]: e.target.value })
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signup(formData)
      // Redirect based on selected role
      const role = formData.role || 'customer'
      if (role === 'admin') {
        navigate('/admin/dashboard')
      } else if (role === 'staff') {
        navigate('/staff/dashboard')
      } else {
        navigate('/customer/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '3vh', marginBottom: '3vh' }}>
      <Paper elevation={3} style={{ padding: 40, borderRadius: 12 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your account to get started
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.role || 'customer'}
                  label="Account Type"
                  onChange={(e) => handleChange('role')({ target: { value: e.target.value } })}
                >
                  <MenuItem value="customer">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonAdd fontSize="small" />
                      <Typography>Customer</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="staff">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Groups fontSize="small" />
                      <Typography>Staff</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box display="flex" alignItems="center" gap={1}>
                      <AdminPanelSettings fontSize="small" />
                      <Typography>Admin</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={formData.role === 'customer' || !formData.role ? 6 : 12}>
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleChange('phone')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {(formData.role === 'customer' || !formData.role) && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer ID"
                  value={formData.customerId}
                  onChange={handleChange('customerId')}
                  required={formData.role === 'customer'}
                  helperText="Your unique customer identifier"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose (Optional)"
                value={formData.purpose}
                onChange={handleChange('purpose')}
                multiline
                rows={2}
                helperText="Describe the purpose of your account"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                required
                helperText="Minimum 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: 'var(--brand)' }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  )
}
