import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { crmApi, Account } from '../api/crm'
import PageHeader from '../components/PageHeader'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  InputAdornment,
} from '@mui/material'
import { Search, Edit, Delete, Visibility, Email, Phone } from '@mui/icons-material'

type AccountRow = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  createdAt: string
}

export default function AccountsPage() {
  const { user, hasRole } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [rows, setRows] = useState<AccountRow[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredRows, setFilteredRows] = useState<AccountRow[]>([])

  const isAdmin = hasRole('admin')

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    // Filter rows based on search query
    if (!searchQuery.trim()) {
      setFilteredRows(rows)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = rows.filter(row =>
        row.name.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.phone.toLowerCase().includes(query) ||
        row.company.toLowerCase().includes(query)
      )
      setFilteredRows(filtered)
    }
  }, [searchQuery, rows])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedAccounts = await crmApi.getAllAccounts()
      setAccounts(fetchedAccounts)
      
      const mappedRows: AccountRow[] = fetchedAccounts.map((account: Account) => ({
        id: account.id,
        name: account.name,
        email: account.email || 'N/A',
        phone: account.phone || 'N/A',
        company: account.company || 'N/A',
        createdAt: new Date(account.createdAt).toLocaleDateString(),
      }))
      setRows(mappedRows)
      setFilteredRows(mappedRows)
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err)
      setError(err.message || 'Failed to fetch accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAccount = (row: AccountRow) => {
    const account = accounts.find(a => a.id === row.id)
    if (account) {
      setSelectedAccount(account)
      setFormData({
        name: account.name,
        email: account.email || '',
        phone: account.phone || '',
        company: account.company || '',
      })
      setOpenDialog(true)
    }
  }

  const handleSaveAccount = async () => {
    try {
      setError(null)
      setSuccess(null)
      
      if (!formData.name || !selectedAccount) {
        setError('Name is required')
        return
      }

      await crmApi.updateAccount(selectedAccount.id, formData)
      setSuccess('Account updated successfully')
      setOpenDialog(false)
      fetchAccounts()
    } catch (err: any) {
      console.error('Failed to save account:', err)
      setError(err.message || 'Failed to save account')
    }
  }

  const handleDeleteAccount = async (row: AccountRow) => {
    if (!window.confirm(`Are you sure you want to delete account "${row.name}"?`)) {
      return
    }

    try {
      setError(null)
      await crmApi.deleteAccount(row.id)
      setSuccess('Account deleted successfully')
      fetchAccounts()
    } catch (err: any) {
      console.error('Failed to delete account:', err)
      setError(err.message || 'Failed to delete account')
    }
  }

  const handleViewAccount = (row: AccountRow) => {
    const account = accounts.find(a => a.id === row.id)
    if (account) {
      setSelectedAccount(account)
      setFormData({
        name: account.name,
        email: account.email || '',
        phone: account.phone || '',
        company: account.company || '',
      })
      setOpenDialog(true)
    }
  }

  const handleSendEmail = (email: string) => {
    if (email && email !== 'N/A') {
      window.location.href = `mailto:${email}`
    }
  }

  const columns = [
    { key: 'name' as keyof AccountRow, label: 'Account Name' },
    { key: 'email' as keyof AccountRow, label: 'Email' },
    { key: 'phone' as keyof AccountRow, label: 'Phone' },
    { key: 'company' as keyof AccountRow, label: 'Company' },
    { key: 'createdAt' as keyof AccountRow, label: 'Created' },
  ]

  return (
    <Container maxWidth="xl" style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper elevation={0} style={{ padding: 24, background: '#fff' }}>
        <PageHeader
          title="Accounts Management"
          right={
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                style={{ width: 300 }}
              />
            </Box>
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
          <Box style={{ textAlign: 'center', padding: 40 }}>
            <Typography>Loading accounts...</Typography>
          </Box>
        ) : filteredRows.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: 40 }}>
            <Typography color="textSecondary">
              {searchQuery ? 'No accounts found matching your search.' : 'No accounts found. Convert a lead to create your first account.'}
            </Typography>
          </Box>
        ) : (
          <Box>
            <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e6e6e6' }}>
              <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--brand)', color: '#fff' }}>
                  <tr>
                    {columns.map((col) => (
                      <th key={String(col.key)} align="left" style={{ fontWeight: 700, fontSize: 13 }}>
                        {col.label}
                      </th>
                    ))}
                    <th align="center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleViewAccount(row)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <td style={{ fontSize: 13 }}>{row.name}</td>
                      <td style={{ fontSize: 13 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {row.email}
                          {row.email !== 'N/A' && (
                            <Button
                              size="small"
                              startIcon={<Email />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSendEmail(row.email)
                              }}
                              style={{ minWidth: 'auto', padding: '4px 8px' }}
                            >
                              Email
                            </Button>
                          )}
                        </Box>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {row.phone}
                          {row.phone !== 'N/A' && (
                            <Button
                              size="small"
                              startIcon={<Phone />}
                              onClick={(e) => {
                                e.stopPropagation()
                                window.location.href = `tel:${row.phone}`
                              }}
                              style={{ minWidth: 'auto', padding: '4px 8px' }}
                            >
                              Call
                            </Button>
                          )}
                        </Box>
                      </td>
                      <td style={{ fontSize: 13 }}>{row.company}</td>
                      <td style={{ fontSize: 13 }}>{row.createdAt}</td>
                      <td align="center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          onClick={() => handleEditAccount(row)}
                          style={{ marginRight: 4 }}
                          startIcon={<Edit />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteAccount(row)}
                          color="error"
                          startIcon={<Delete />}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {searchQuery && (
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                Showing {filteredRows.length} of {rows.length} accounts
              </Typography>
            )}
          </Box>
        )}

        {/* Edit Account Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>View/Edit Account</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            {selectedAccount && (
              <Button onClick={handleSaveAccount} variant="contained" style={{ background: 'var(--brand)' }}>
                Update
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  )
}
