import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { crmApi, Opportunity } from '../api/crm'
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
import { Edit, Delete, Search } from '@mui/icons-material'

type OpportunityRow = {
  id: string
  name: string
  value: string
  stage: string
  accountName: string
  createdAt: string
}

export default function OpportunitiesPage() {
  const { user, hasRole } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [rows, setRows] = useState<OpportunityRow[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    name: '',
    value: 0,
    stage: 'PROSPECT',
    probability: 0,
    expectedCloseDate: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('ALL')
  const [filteredRows, setFilteredRows] = useState<OpportunityRow[]>([])

  const isAdmin = hasRole('admin')

  useEffect(() => {
    fetchOpportunities()
  }, [])

  useEffect(() => {
    // Filter rows based on search query and stage
    let filtered = rows

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(row =>
        row.name.toLowerCase().includes(query) ||
        row.accountName.toLowerCase().includes(query) ||
        row.value.toLowerCase().includes(query)
      )
    }

    // Apply stage filter
    if (stageFilter !== 'ALL') {
      filtered = filtered.filter(row => row.stage === stageFilter)
    }

    setFilteredRows(filtered)
  }, [searchQuery, stageFilter, rows])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedOpportunities = await crmApi.getAllOpportunities()
      setOpportunities(fetchedOpportunities)
      
      const mappedRows: OpportunityRow[] = fetchedOpportunities.map((opp: Opportunity) => ({
        id: opp.id,
        name: opp.name,
        value: `$${opp.value.toLocaleString()}`,
        stage: opp.stage,
        accountName: opp.accountName || 'N/A',
        createdAt: new Date(opp.createdAt).toLocaleDateString(),
      }))
      setRows(mappedRows)
    } catch (err: any) {
      console.error('Failed to fetch opportunities:', err)
      setError(err.message || 'Failed to fetch opportunities')
    } finally {
      setLoading(false)
    }
  }

  const handleEditOpportunity = (row: OpportunityRow) => {
    const opportunity = opportunities.find(o => o.id === row.id)
    if (opportunity) {
      setSelectedOpportunity(opportunity)
      setFormData({
        name: opportunity.name,
        value: opportunity.value,
        stage: opportunity.stage,
        probability: opportunity.probability || 0,
        expectedCloseDate: opportunity.expectedCloseDate || '',
      })
      setOpenDialog(true)
    }
  }

  const handleSaveOpportunity = async () => {
    try {
      setError(null)
      setSuccess(null)
      
      if (!formData.name || !selectedOpportunity) {
        setError('Name is required')
        return
      }

      await crmApi.updateOpportunity(selectedOpportunity.id, formData)
      setSuccess('Opportunity updated successfully')
      setOpenDialog(false)
      fetchOpportunities()
    } catch (err: any) {
      console.error('Failed to save opportunity:', err)
      setError(err.message || 'Failed to save opportunity')
    }
  }

  const handleDeleteOpportunity = async (row: OpportunityRow) => {
    if (!window.confirm(`Are you sure you want to delete opportunity "${row.name}"?`)) {
      return
    }

    try {
      setError(null)
      await crmApi.deleteOpportunity(row.id)
      setSuccess('Opportunity deleted successfully')
      fetchOpportunities()
    } catch (err: any) {
      console.error('Failed to delete opportunity:', err)
      setError(err.message || 'Failed to delete opportunity')
    }
  }

  const handleViewOpportunity = (row: OpportunityRow) => {
    const opportunity = opportunities.find(o => o.id === row.id)
    if (opportunity) {
      setSelectedOpportunity(opportunity)
      setFormData({
        name: opportunity.name,
        value: opportunity.value,
        stage: opportunity.stage,
        probability: opportunity.probability || 0,
        expectedCloseDate: opportunity.expectedCloseDate || '',
      })
      setOpenDialog(true)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'PROSPECT':
        return 'default'
      case 'QUALIFIED':
        return 'info'
      case 'PROPOSAL':
        return 'primary'
      case 'NEGOTIATION':
        return 'warning'
      case 'CLOSED_WON':
        return 'success'
      case 'CLOSED_LOST':
        return 'error'
      default:
        return 'default'
    }
  }

  const getTotalValue = () => {
    return opportunities.reduce((sum, opp) => sum + opp.value, 0)
  }

  const getStageCounts = () => {
    const counts: Record<string, number> = {}
    opportunities.forEach(opp => {
      counts[opp.stage] = (counts[opp.stage] || 0) + 1
    })
    return counts
  }

  const columns = [
    { key: 'name' as keyof OpportunityRow, label: 'Opportunity Name' },
    { key: 'value' as keyof OpportunityRow, label: 'Value' },
    { key: 'stage' as keyof OpportunityRow, label: 'Stage' },
    { key: 'accountName' as keyof OpportunityRow, label: 'Account' },
    { key: 'createdAt' as keyof OpportunityRow, label: 'Created' },
  ]

  const stageCounts = getStageCounts()

  return (
    <Container maxWidth="xl" style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper elevation={0} style={{ padding: 24, background: '#fff' }}>
        <PageHeader
          title="Opportunities Management"
          right={
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search opportunities..."
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
                <InputLabel>Stage</InputLabel>
                <Select
                  value={stageFilter}
                  label="Stage"
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Stages</MenuItem>
                  <MenuItem value="PROSPECT">Prospect</MenuItem>
                  <MenuItem value="QUALIFIED">Qualified</MenuItem>
                  <MenuItem value="PROPOSAL">Proposal</MenuItem>
                  <MenuItem value="NEGOTIATION">Negotiation</MenuItem>
                  <MenuItem value="CLOSED_WON">Closed Won</MenuItem>
                  <MenuItem value="CLOSED_LOST">Closed Lost</MenuItem>
                </Select>
              </FormControl>
            </Box>
          }
        />

        {/* Summary Cards */}
        <Grid container spacing={2} style={{ marginBottom: 24 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} style={{ padding: 16, background: '#f5f5f5' }}>
              <Typography variant="body2" color="textSecondary">
                Total Opportunities
              </Typography>
              <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                {opportunities.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} style={{ padding: 16, background: '#f5f5f5' }}>
              <Typography variant="body2" color="textSecondary">
                Total Value
              </Typography>
              <Typography variant="h5" style={{ fontWeight: 'bold', color: 'var(--brand)' }}>
                ${getTotalValue().toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} style={{ padding: 16, background: '#f5f5f5' }}>
              <Typography variant="body2" color="textSecondary">
                Won
              </Typography>
              <Typography variant="h5" style={{ fontWeight: 'bold', color: '#4caf50' }}>
                {stageCounts['CLOSED_WON'] || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} style={{ padding: 16, background: '#f5f5f5' }}>
              <Typography variant="body2" color="textSecondary">
                In Pipeline
              </Typography>
              <Typography variant="h5" style={{ fontWeight: 'bold', color: '#2196f3' }}>
                {opportunities.filter(o => !['CLOSED_WON', 'CLOSED_LOST'].includes(o.stage)).length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

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
            <Typography>Loading opportunities...</Typography>
          </Box>
        ) : filteredRows.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: 40 }}>
            <Typography color="textSecondary">
              {searchQuery || stageFilter !== 'ALL' ? 'No opportunities found matching your filters.' : 'No opportunities found. Convert a lead to create your first opportunity.'}
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
                      onClick={() => handleViewOpportunity(row)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {columns.map((col) => (
                        <td key={String(col.key)} style={{ fontSize: 13 }}>
                          {col.key === 'stage' ? (
                            <Chip
                              label={row.stage}
                              size="small"
                              color={getStageColor(row.stage) as any}
                              style={{ fontSize: 11 }}
                            />
                          ) : (
                            String(row[col.key] ?? '')
                          )}
                        </td>
                      ))}
                      <td align="center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          onClick={() => handleEditOpportunity(row)}
                          style={{ marginRight: 4 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteOpportunity(row)}
                          color="error"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(searchQuery || stageFilter !== 'ALL') && (
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                Showing {filteredRows.length} of {rows.length} opportunities
              </Typography>
            )}
          </Box>
        )}

        {/* Edit Opportunity Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Opportunity</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Opportunity Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Value ($)"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={formData.stage}
                    label="Stage"
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as Opportunity['stage'] })}
                  >
                    <MenuItem value="PROSPECT">Prospect</MenuItem>
                    <MenuItem value="QUALIFIED">Qualified</MenuItem>
                    <MenuItem value="PROPOSAL">Proposal</MenuItem>
                    <MenuItem value="NEGOTIATION">Negotiation</MenuItem>
                    <MenuItem value="CLOSED_WON">Closed Won</MenuItem>
                    <MenuItem value="CLOSED_LOST">Closed Lost</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Probability (%)"
                  type="number"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Close Date"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveOpportunity} variant="contained" style={{ background: 'var(--brand)' }}>
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  )
}
