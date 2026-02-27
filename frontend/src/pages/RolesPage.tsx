import React, { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { rolesApi, Role, AVAILABLE_PERMISSIONS } from '../api/roles'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
} from '@mui/material'
import { Add, Edit, Delete, Close } from '@mui/icons-material'

type RoleRow = {
  id: string
  name: string
  permissions: string[]
  bio?: string
  signupForm?: string
}

const tagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: 6,
  border: '1px solid #e0e0e0',
  marginRight: 6,
  marginBottom: 6,
  fontSize: 12,
  backgroundColor: '#f5f5f5',
}

export default function RolesPage() {
  const [rows, setRows] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [bioDialog, setBioDialog] = useState(false)
  const [signupDialog, setSignupDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
    bio: '',
    signupForm: '',
  })
  const [selectedPermission, setSelectedPermission] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const roles = await rolesApi.getAll()
      const mappedRows: RoleRow[] = roles.map((role: Role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions || [],
        bio: role.bio,
        signupForm: role.signupForm,
      }))
      setRows(mappedRows)
    } catch (err: any) {
      console.error('Failed to fetch roles:', err)
      setError('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = () => {
    setFormData({ name: '', permissions: [], bio: '', signupForm: '' })
    setSelectedRole(null)
    setOpenDialog(true)
  }

  const handleEditRole = (row: RoleRow) => {
    setSelectedRole(row)
    setFormData({
      name: row.name,
      permissions: row.permissions || [],
      bio: row.bio || '',
      signupForm: row.signupForm || '',
    })
    setOpenDialog(true)
  }

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      setError('Role name is required')
      return
    }

    try {
      setError(null)
      if (selectedRole) {
        // Update existing role
        await rolesApi.update(selectedRole.id, {
          name: formData.name.trim(),
          permissions: formData.permissions,
          bio: formData.bio,
          signupForm: formData.signupForm,
        })
        setSuccess('Role updated successfully!')
      } else {
        // Create new role
        await rolesApi.create({
          name: formData.name.trim(),
          permissions: formData.permissions,
          bio: formData.bio,
          signupForm: formData.signupForm,
        })
        setSuccess('Role created successfully!')
      }
      setOpenDialog(false)
      await fetchRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save role')
    }
  }

  const handleDeleteRole = async (row: RoleRow) => {
    if (!window.confirm(`Delete role "${row.name}"?`)) return

    try {
      await rolesApi.delete(row.id)
      setSuccess('Role deleted successfully!')
      await fetchRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete role')
    }
  }

  const handleAddPermission = async (roleId: string, permission: string) => {
    if (!permission) return
    try {
      await rolesApi.addPermission(roleId, permission)
      await fetchRoles()
    } catch (err: any) {
      setError(err.message || 'Failed to add permission')
    }
  }

  const handleRemovePermission = async (roleId: string, permission: string) => {
    try {
      await rolesApi.removePermission(roleId, permission)
      await fetchRoles()
    } catch (err: any) {
      setError(err.message || 'Failed to remove permission')
    }
  }

  const handleViewBio = (row: RoleRow) => {
    setSelectedRole(row)
    setFormData({ ...formData, bio: row.bio || '' })
    setBioDialog(true)
  }

  const handleViewSignup = (row: RoleRow) => {
    setSelectedRole(row)
    setFormData({ ...formData, signupForm: row.signupForm || '' })
    setSignupDialog(true)
  }

  const handleSaveBio = async () => {
    if (!selectedRole) return
    try {
      await rolesApi.update(selectedRole.id, { bio: formData.bio })
      setBioDialog(false)
      await fetchRoles()
      setSuccess('Bio updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save bio')
    }
  }

  const handleSaveSignup = async () => {
    if (!selectedRole) return
    try {
      await rolesApi.update(selectedRole.id, { signupForm: formData.signupForm })
      setSignupDialog(false)
      await fetchRoles()
      setSuccess('Signup form updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save signup form')
    }
  }

  return (
    <div className="card">
      <PageHeader
        title="Roles"
        right={
          <button className="btn" onClick={handleAddRole}>
            Add Role
          </button>
        }
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} style={{ marginBottom: 16 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading roles...</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          No roles found. Click "Add Role" to create your first role.
        </div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--brand)', color: '#fff' }}>
              <tr>
                <th align="left">Name</th>
                <th align="left">Permissions</th>
                <th align="center">Bio</th>
                <th align="center">Signup</th>
                <th align="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ fontWeight: 500 }}>{row.name}</td>
                  <td>
                    <Box display="flex" flexWrap="wrap" gap={0.5} alignItems="center" style={{ marginBottom: 8 }}>
                      {row.permissions.length > 0 ? (
                        row.permissions.map((p) => (
                          <Chip
                            key={p}
                            label={p}
                            size="small"
                            onDelete={() => handleRemovePermission(row.id, p)}
                            style={tagStyle}
                          />
                        ))
                      ) : (
                        <span style={{ color: '#999', fontSize: 12 }}>No permissions</span>
                      )}
                    </Box>
                    <FormControl size="small" style={{ minWidth: 140 }}>
                      <Select
                        value={selectedPermission}
                        displayEmpty
                        onChange={(e) => {
                          const perm = e.target.value as string
                          if (perm) {
                            handleAddPermission(row.id, perm)
                            setSelectedPermission('')
                          }
                        }}
                      >
                        <MenuItem value="" disabled>
                          Add Permission
                        </MenuItem>
                        {AVAILABLE_PERMISSIONS.filter(p => !row.permissions.includes(p)).map((perm) => (
                          <MenuItem key={perm} value={perm}>
                            {perm}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </td>
                  <td align="center">
                    <button className="btn btn-secondary" onClick={() => handleViewBio(row)}>
                      Extended Bio
                    </button>
                  </td>
                  <td align="center">
                    <button className="btn" onClick={() => handleViewSignup(row)}>
                      Signup Form
                    </button>
                  </td>
                  <td align="center">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditRole(row)}
                      style={{ marginRight: 4 }}
                    >
                      Edit
                    </button>
                    <button className="btn" onClick={() => handleDeleteRole(row)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Permissions
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {formData.permissions.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  onDelete={() => {
                    setFormData({
                      ...formData,
                      permissions: formData.permissions.filter(perm => perm !== p),
                    })
                  }}
                />
              ))}
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>Add Permission</InputLabel>
              <Select
                value={selectedPermission}
                onChange={(e) => {
                  const perm = e.target.value as string
                  if (perm && !formData.permissions.includes(perm)) {
                    setFormData({
                      ...formData,
                      permissions: [...formData.permissions, perm],
                    })
                    setSelectedPermission('')
                  }
                }}
              >
                <MenuItem value="">Select Permission</MenuItem>
                {AVAILABLE_PERMISSIONS.filter(p => !formData.permissions.includes(p)).map((perm) => (
                  <MenuItem key={perm} value={perm}>
                    {perm}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" style={{ background: 'var(--brand)' }}>
            {selectedRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extended Bio Dialog */}
      <Dialog open={bioDialog} onClose={() => setBioDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Extended Bio - {selectedRole?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Extended Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            margin="normal"
            placeholder="Enter extended bio information for this role..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBioDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveBio} variant="contained" style={{ background: 'var(--brand)' }}>
            Save Bio
          </Button>
        </DialogActions>
      </Dialog>

      {/* Signup Form Dialog */}
      <Dialog open={signupDialog} onClose={() => setSignupDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Signup Form - {selectedRole?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Signup Form Configuration"
            value={formData.signupForm}
            onChange={(e) => setFormData({ ...formData, signupForm: e.target.value })}
            margin="normal"
            placeholder="Enter signup form configuration (JSON or text)..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignupDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSignup} variant="contained" style={{ background: 'var(--brand)' }}>
            Save Form
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
