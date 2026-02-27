import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { crmApi, Lead } from '../api/crm'
import { activityTracking, getCurrentUserInfo, createActivityDescription } from '../api/activityTracking'
import PageHeader from '../components/PageHeader'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  InputAdornment,
} from '@mui/material'
import { Add, TrendingUp, Edit, Delete, Visibility, Search, Email, Refresh } from '@mui/icons-material'

type LeadRow = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  createdAt: string
}

export default function LeadsManagementPage() {
  const { user, hasRole } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [rows, setRows] = useState<LeadRow[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [convertDialog, setConvertDialog] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'NEW',
    notes: '',
  })
  const [convertValue, setConvertValue] = useState<string>('0')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [filteredRows, setFilteredRows] = useState<LeadRow[]>([])

  const isAdmin = hasRole('admin')

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    // Filter rows based on search query and status
    let filtered = rows

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(row =>
        row.name.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.phone.toLowerCase().includes(query) ||
        row.company.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(row => row.status === statusFilter)
    }

    setFilteredRows(filtered)
  }, [searchQuery, statusFilter, rows])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedLeads = await crmApi.getAllLeads()
      console.log('📋 Fetched leads:', fetchedLeads.length)
      console.log('📋 Leads data:', fetchedLeads)
      
      // Also check localStorage directly for debugging
      try {
        const localLeads = JSON.parse(localStorage.getItem('localLeads') || '[]')
        console.log('📋 localStorage leads:', localLeads.length, localLeads)
      } catch (e) {
        console.error('Error reading localStorage leads:', e)
      }
      
      setLeads(fetchedLeads)
      
      const mappedRows: LeadRow[] = fetchedLeads
        .filter((lead: Lead) => lead && lead.id && lead.name) // Filter out invalid leads
        .map((lead: Lead) => ({
          id: lead.id,
          name: lead.name || 'Unknown',
          email: lead.email || 'N/A',
          phone: lead.phone || 'N/A',
          company: lead.company || 'N/A',
          status: lead.status || 'NEW',
          createdAt: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        }))
      
      console.log('📋 Mapped rows:', mappedRows.length)
      console.log('📋 Row data:', mappedRows)
      setRows(mappedRows)
    } catch (err: any) {
      console.error('Failed to fetch leads:', err)
      setError(err.message || 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLead = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'NEW',
      notes: '',
    })
    setSelectedLead(null)
    setOpenDialog(true)
  }

  const handleEditLead = (row: LeadRow) => {
    const lead = leads.find(l => l.id === row.id)
    if (lead) {
      setSelectedLead(lead)
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company || '',
        status: lead.status,
        notes: lead.notes || '',
      })
      setOpenDialog(true)
    }
  }

  const handleSaveLead = async () => {
    try {
      setError(null)
      setSuccess(null)
      
      if (!formData.name || !formData.email) {
        setError('Name and email are required')
        return
      }

      if (selectedLead) {
        await crmApi.updateLead(selectedLead.id, formData)
        setSuccess('Lead updated successfully')
      } else {
        await crmApi.createLead(formData)
        setSuccess('Lead created successfully')
      }
      
      setOpenDialog(false)
      fetchLeads()
    } catch (err: any) {
      console.error('Failed to save lead:', err)
      setError(err.message || 'Failed to save lead')
    }
  }

  const handleDeleteLead = async (row: LeadRow) => {
    if (!window.confirm(`Are you sure you want to delete lead "${row.name}"?`)) {
      return
    }

    try {
      setError(null)
      await crmApi.deleteLead(row.id)
      setSuccess('Lead deleted successfully')
      fetchLeads()
    } catch (err: any) {
      console.error('Failed to delete lead:', err)
      setError(err.message || 'Failed to delete lead')
    }
  }

  const handleViewLead = (row: LeadRow) => {
    const lead = leads.find(l => l.id === row.id)
    if (lead) {
      setSelectedLead(lead)
      setConvertDialog(true)
    }
  }

  const handleSendEmail = async (lead: Lead) => {
    if (lead.email) {
      // Log email activity
      const userInfo = getCurrentUserInfo()
      activityTracking.log({
        type: 'lead',
        entityId: lead.id,
        entityName: lead.name,
        action: 'email_sent',
        userId: userInfo.id,
        userName: userInfo.name,
        description: createActivityDescription('email_sent', lead.name),
      })
      
      // Open email client
      window.location.href = `mailto:${lead.email}?subject=Regarding ${lead.name}`
    }
  }

  const handleConvertLead = async () => {
    if (!selectedLead) return

    try {
      setError(null)
      setSuccess(null)
      const value = parseFloat(convertValue) || 0
      const result = await crmApi.convertLead(selectedLead.id, value)
      setSuccess(`Lead converted successfully! Account "${result.account.name}" and Opportunity "${result.opportunity.name}" created.`)
      setConvertDialog(false)
      fetchLeads()
    } catch (err: any) {
      console.error('Failed to convert lead:', err)
      setError(err.message || 'Failed to convert lead')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'default'
      case 'CONTACTED':
        return 'info'
      case 'QUALIFIED':
        return 'primary'
      case 'CONVERTED':
        return 'success'
      case 'LOST':
        return 'error'
      default:
        return 'default'
    }
  }

  const columns = [
    { key: 'name' as keyof LeadRow, label: 'Name' },
    { key: 'email' as keyof LeadRow, label: 'Email' },
    { key: 'phone' as keyof LeadRow, label: 'Phone' },
    { key: 'company' as keyof LeadRow, label: 'Company' },
    { key: 'status' as keyof LeadRow, label: 'Status' },
    { key: 'createdAt' as keyof LeadRow, label: 'Created' },
  ]

  return (
    <Container maxWidth="xl" style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper elevation={0} style={{ padding: 24, background: '#fff' }}>
        <PageHeader
          title="Leads Management"
          right={
            <Box display="flex" gap={2} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={fetchLeads}
                title="Refresh leads list"
              >
                Refresh
              </Button>
              <TextField
                size="small"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                style={{ width: 250 }}
              />
              <FormControl size="small" style={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="NEW">New</MenuItem>
                  <MenuItem value="CONTACTED">Contacted</MenuItem>
                  <MenuItem value="QUALIFIED">Qualified</MenuItem>
                  <MenuItem value="CONVERTED">Converted</MenuItem>
                  <MenuItem value="LOST">Lost</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateLead}
                style={{ background: 'var(--brand)', color: '#fff' }}
              >
                Create Lead
              </Button>
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
            <Typography>Loading leads...</Typography>
          </Box>
        ) : filteredRows.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: 40 }}>
            <Typography color="textSecondary" style={{ marginBottom: 16 }}>
              {searchQuery || statusFilter !== 'ALL' ? 'No leads found matching your filters.' : 'No leads found. Create your first lead to get started.'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                console.log('🔍 Manual check - localStorage leads:', JSON.parse(localStorage.getItem('localLeads') || '[]'))
                console.log('🔍 Manual check - Current leads state:', leads)
                console.log('🔍 Manual check - Current rows state:', rows)
                fetchLeads()
              }}
            >
              Debug: Check localStorage
            </Button>
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
                      onClick={() => handleViewLead(row)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {columns.map((col) => (
                        <td key={String(col.key)} style={{ fontSize: 13 }}>
                          {col.key === 'status' ? (
                            <Chip
                              label={row.status}
                              size="small"
                              color={getStatusColor(row.status) as any}
                              style={{ fontSize: 11 }}
                            />
                          ) : col.key === 'email' ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              {row.email}
                              {row.email && row.email !== 'N/A' && (
                                <Button
                                  size="small"
                                  startIcon={<Email />}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const lead = leads.find(l => l.id === row.id)
                                    if (lead) handleSendEmail(lead)
                                  }}
                                  style={{ minWidth: 'auto', padding: '4px 8px', fontSize: 11 }}
                                >
                                  Email
                                </Button>
                              )}
                            </Box>
                          ) : (
                            String(row[col.key] ?? '')
                          )}
                        </td>
                      ))}
                      <td align="center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          onClick={() => handleEditLead(row)}
                          style={{ marginRight: 4 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteLead(row)}
                          color="error"
                          style={{ marginRight: 4 }}
                        >
                          Delete
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleViewLead(row)}
                          variant="contained"
                          startIcon={<TrendingUp />}
                          style={{ background: 'var(--brand)' }}
                        >
                          Convert
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(searchQuery || statusFilter !== 'ALL') && (
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                Showing {filteredRows.length} of {rows.length} leads
              </Typography>
            )}
          </Box>
        )}

        {/* Create/Edit Lead Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedLead ? 'Edit Lead' : 'Create New Lead'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                  >
                    <MenuItem value="NEW">New</MenuItem>
                    <MenuItem value="CONTACTED">Contacted</MenuItem>
                    <MenuItem value="QUALIFIED">Qualified</MenuItem>
                    <MenuItem value="CONVERTED">Converted</MenuItem>
                    <MenuItem value="LOST">Lost</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLead} variant="contained" style={{ background: 'var(--brand)' }}>
              {selectedLead ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Convert Lead Dialog */}
        <Dialog open={convertDialog} onClose={() => setConvertDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUp />
              Convert Lead to Opportunity
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedLead && (
              <Box>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                  This will create an Account and Opportunity from the lead "{selectedLead.name}".
                </Typography>
                <TextField
                  fullWidth
                  label="Opportunity Value"
                  type="number"
                  value={convertValue}
                  onChange={(e) => setConvertValue(e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                  style={{ marginTop: 16 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConvertDialog(false)}>Cancel</Button>
            <Button
              onClick={handleConvertLead}
              variant="contained"
              style={{ background: 'var(--brand)' }}
              startIcon={<TrendingUp />}
            >
              Convert
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  )
}
