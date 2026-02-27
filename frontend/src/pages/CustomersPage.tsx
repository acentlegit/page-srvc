import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { customersApi, Customer } from '../api/customers'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Box,
  Typography,
} from '@mui/material'
import { Add, Edit, Delete, Visibility, Search, FileDownload, ContentCopy } from '@mui/icons-material'

type CustomerRow = {
  id: string
  blocked: string
  name: string
  email: string
  phone: string
  createdBy: string
  createdAt: string
}

export default function CustomersPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')
  const [templateFilter, setTemplateFilter] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    blocked: 'OFF' as 'ON' | 'OFF',
    building: '',
    template: '',
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'blocked', label: 'Blocked' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'createdBy', label: 'createdBy' },
    { key: 'createdAt', label: 'createdAt' },
  ] as const

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const customers = await customersApi.getAll()
      setAllCustomers(customers)
      
      const mappedRows: CustomerRow[] = customers.map((customer: Customer) => ({
        id: customer.id,
        blocked: customer.blocked,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdBy: customer.createdBy || 'admin',
        createdAt: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      }))
      
      setRows(mappedRows)
    } catch (err: any) {
      console.error('Failed to fetch customers:', err)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(() => {
    let filtered = rows

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(row =>
        row.name.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.phone.toLowerCase().includes(query) ||
        row.id.toLowerCase().includes(query)
      )
    }

    // Apply building filter
    if (buildingFilter && buildingFilter !== 'Select Building') {
      filtered = filtered.filter(row => {
        const customer = allCustomers.find(c => c.id === row.id)
        return customer?.building === buildingFilter
      })
    }

    // Apply template filter
    if (templateFilter && templateFilter !== 'Select Template') {
      filtered = filtered.filter(row => {
        const customer = allCustomers.find(c => c.id === row.id)
        return customer?.template === templateFilter
      })
    }

    return filtered
  }, [rows, searchQuery, buildingFilter, templateFilter, allCustomers])

  const handleAddCustomer = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      blocked: 'OFF',
      building: '',
      template: '',
      notes: '',
    })
    setSelectedCustomer(null)
    setOpenDialog(true)
  }

  const handleSaveCustomer = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required')
      return
    }

    try {
      setError(null)
      if (selectedCustomer) {
        // Update existing customer
        await customersApi.update(selectedCustomer.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          blocked: formData.blocked,
          building: formData.building || undefined,
          template: formData.template || undefined,
          notes: formData.notes || undefined,
        })
        setSuccess('Customer updated successfully!')
      } else {
        // Create new customer
        await customersApi.create({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          blocked: formData.blocked,
          building: formData.building || undefined,
          template: formData.template || undefined,
          notes: formData.notes || undefined,
        })
        setSuccess('Customer created successfully!')
      }
      setOpenDialog(false)
      await fetchCustomers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save customer')
    }
  }

  const handleEdit = (row: CustomerRow) => {
    const customer = allCustomers.find(c => c.id === row.id)
    if (customer) {
      setSelectedCustomer(customer)
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        blocked: customer.blocked,
        building: customer.building || '',
        template: customer.template || '',
        notes: customer.notes || '',
      })
      setOpenDialog(true)
    }
  }

  const handleDelete = async (row: CustomerRow) => {
    if (!window.confirm(`Delete customer "${row.name}"?`)) return

    try {
      await customersApi.delete(row.id)
      setSuccess('Customer deleted successfully!')
      await fetchCustomers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete customer')
    }
  }

  const handleView = (row: CustomerRow) => {
    const customer = allCustomers.find(c => c.id === row.id)
    if (customer) {
      setSelectedCustomer(customer)
      setViewDialog(true)
    }
  }

  const handleCopyCustomerUrl = (row: CustomerRow) => {
    const url = `${window.location.origin}/customer/dashboard?customerId=${row.id}`
    navigator.clipboard.writeText(url).then(() => {
      setSuccess('Customer URL copied to clipboard!')
      setTimeout(() => setSuccess(null), 3000)
    }).catch(() => {
      setError('Failed to copy URL')
    })
  }

  const handleCopyServiceFormUrl = (row: CustomerRow) => {
    const url = `${window.location.origin}/customer/forms?customerId=${row.id}`
    navigator.clipboard.writeText(url).then(() => {
      setSuccess('Service Form URL copied to clipboard!')
      setTimeout(() => setSuccess(null), 3000)
    }).catch(() => {
      setError('Failed to copy URL')
    })
  }

  const handleUploadToExcel = () => {
    // Convert rows to CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Blocked', 'Created By', 'Created At']
    const csvRows = [
      headers.join(','),
      ...filteredRows.map(row =>
        [
          row.id,
          `"${row.name}"`,
          row.email,
          row.phone,
          row.blocked,
          row.createdBy,
          row.createdAt,
        ].join(',')
      ),
    ]
    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setSuccess('Customers exported to CSV!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleLawReport = () => {
    setSuccess('Law Report feature coming soon!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleMentionReport = () => {
    setSuccess('Mention Report feature coming soon!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleSubmit = () => {
    setSuccess('Submit feature coming soon!')
    setTimeout(() => setSuccess(null), 3000)
  }

  // Get unique buildings and templates for filters
  const buildings = useMemo(() => {
    const buildingSet = new Set<string>()
    allCustomers.forEach(c => {
      if (c.building) buildingSet.add(c.building)
    })
    return Array.from(buildingSet).sort()
  }, [allCustomers])

  const templates = useMemo(() => {
    const templateSet = new Set<string>()
    allCustomers.forEach(c => {
      if (c.template) templateSet.add(c.template)
    })
    return Array.from(templateSet).sort()
  }, [allCustomers])

  return (
    <div className="card">
      <PageHeader title="Customers" />

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 12 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Search style={{ color: '#999' }} />
          <input
            className="input"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
        </Box>
        <select
          className="select"
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
        >
          <option value="">Select Building</option>
          {buildings.map(building => (
            <option key={building} value={building}>{building}</option>
          ))}
        </select>
        <select
          className="select"
          value={templateFilter}
          onChange={(e) => setTemplateFilter(e.target.value)}
        >
          <option value="">Select Template</option>
          {templates.map(template => (
            <option key={template} value={template}>{template}</option>
          ))}
        </select>
        <button className="btn" onClick={handleAddCustomer}>
          Add Customer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={handleUploadToExcel}>
          Upload to Excel
        </button>
        <button className="btn" onClick={() => {
          if (filteredRows.length > 0) {
            handleCopyCustomerUrl(filteredRows[0])
          } else {
            setError('No customer selected')
          }
        }}>
          Copy Customer URL
        </button>
        <button className="btn btn-secondary" onClick={handleLawReport}>
          Law Report
        </button>
        <button className="btn" onClick={handleSubmit}>
          Submit
        </button>
        <button className="btn btn-secondary" onClick={handleMentionReport}>
          Mention Report
        </button>
        <button className="btn" onClick={() => {
          if (filteredRows.length > 0) {
            handleCopyServiceFormUrl(filteredRows[0])
          } else {
            setError('No customer selected')
          }
        }}>
          Copy Service Form URL
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading customers...</div>
      ) : filteredRows.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          {searchQuery || buildingFilter || templateFilter
            ? 'No customers found matching your filters.'
            : 'No customers found. Click "Add Customer" to create your first customer.'}
        </div>
      ) : (
        <AdminTable<CustomerRow>
          columns={columns as any}
          rows={filteredRows}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {/* Add/Edit Customer Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Blocked</InputLabel>
            <Select
              value={formData.blocked}
              label="Blocked"
              onChange={(e) => setFormData({ ...formData, blocked: e.target.value as 'ON' | 'OFF' })}
            >
              <MenuItem value="OFF">OFF</MenuItem>
              <MenuItem value="ON">ON</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Building"
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Template"
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveCustomer} variant="contained" style={{ background: 'var(--brand)' }}>
            {selectedCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedCustomer.name}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>ID:</strong> {selectedCustomer.id}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Email:</strong> {selectedCustomer.email}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Phone:</strong> {selectedCustomer.phone}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Blocked:</strong> {selectedCustomer.blocked}
              </Typography>
              {selectedCustomer.building && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Building:</strong> {selectedCustomer.building}
                </Typography>
              )}
              {selectedCustomer.template && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Template:</strong> {selectedCustomer.template}
                </Typography>
              )}
              {selectedCustomer.notes && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Notes:</strong> {selectedCustomer.notes}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Created By:</strong> {selectedCustomer.createdBy}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Created At:</strong> {new Date(selectedCustomer.createdAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          {selectedCustomer && (
            <Button
              onClick={() => {
                setViewDialog(false)
                const row = rows.find(r => r.id === selectedCustomer.id)
                if (row) handleEdit(row)
              }}
              variant="contained"
              style={{ background: 'var(--brand)' }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}
