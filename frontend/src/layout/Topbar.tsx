import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, Box, Typography, Menu, MenuItem, Avatar } from '@mui/material'
import { Logout, Person, Settings } from '@mui/icons-material'

export default function Topbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    handleMenuClose()
  }

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'staff': return 'Staff'
      case 'customer': return 'Customer'
      default: return 'User'
    }
  }

  return (
    <div
      style={{
        height: 60,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {user ? (
          <>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                ({getRoleDisplay(user.role)})
              </Typography>
            </Box>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'var(--brand)' }}
              onClick={handleMenuOpen}
              style={{ cursor: 'pointer' }}
            >
              {user.firstName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/settings/profile'); handleMenuClose(); }}>
                <Person sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/settings/account'); handleMenuClose(); }}>
                <Settings sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button variant="outlined" size="small" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </div>
    </div>
  )
}