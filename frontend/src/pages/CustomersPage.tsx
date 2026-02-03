import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'

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
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'blocked', label: 'Blocked' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'createdBy', label: 'createdBy' },
    { key: 'createdAt', label: 'createdAt' },
  ] as const

  const [rows, setRows] = useState<CustomerRow[]>([
    {
      id: 'CUST-1001',
      blocked: 'OFF',
      name: 'Beam Org',
      email: 'org@beam.com',
      phone: '+1 555 0100',
      createdBy: 'admin',
      createdAt: '04/15/2023',
    },
  ])

  const handleView = (row: CustomerRow) => {
    window.alert(
      `Customer: ${row.name}\nEmail: ${row.email}\nPhone: ${row.phone}\nCreatedBy: ${row.createdBy}`,
    )
  }

  const handleEdit = (row: CustomerRow) => {
    const nextName = window.prompt('Customer name', row.name)
    if (!nextName) return
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, name: nextName } : r)))
  }

  const handleDelete = (row: CustomerRow) => {
    const confirmed = window.confirm(`Delete ${row.name}?`)
    if (!confirmed) return
    setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  return (
    <div className="card">
      <PageHeader title="Customers" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 12 }}>
        <input className="input" placeholder="Search" />
        <select className="select" defaultValue="Select Building">
          <option>Select Building</option>
          <option>Building A</option>
          <option>Building B</option>
        </select>
        <select className="select" defaultValue="Select Template">
          <option>Select Template</option>
          <option>Template A</option>
          <option>Template B</option>
        </select>
        <button className="btn" disabled>
          Add Customer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-secondary" disabled>
          Upload to Excel
        </button>
        <button className="btn">Copy Customer URL</button>
        <button className="btn btn-secondary">Law Report</button>
        <button className="btn">Submit</button>
        <button className="btn btn-secondary">Mention Report</button>
        <button className="btn">Copy Service Form URL</button>
      </div>

      <AdminTable<CustomerRow>
        columns={columns as any}
        rows={rows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </div>
  )
}
