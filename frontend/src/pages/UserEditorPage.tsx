import React from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'

type ImportRow = {
  status: string
  name: string
  description: string
  createdAt: string
}

export default function UserEditorPage() {
  const columns = [
    { key: 'status', label: 'Status' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'createdAt' },
  ] as const

  const rows: ImportRow[] = [
    { status: '🟢 register', name: 'register beamv1-5.csv', description: '', createdAt: 'Mon Nov 28 2022' },
    { status: '🟠 modify', name: 'modify beamv1-V.csv', description: '', createdAt: 'Thu Nov 24 2022' },
    { status: '🔴 conflict', name: 'conflict beamv1-5.csv', description: '', createdAt: 'Mon Nov 28 2022' },
  ]

  return (
    <div className="card">
      <PageHeader title="Import People List" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div className="small-label">Select Role to download CSV file template</div>
          <select className="select">
            <option>Select Role</option>
            <option>admin</option>
            <option>manager</option>
            <option>dispatcher</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button className="btn" style={{ background: '#ccc' }}>Download Template</button>
        </div>

        <div>
          <div className="small-label">Select Users Type</div>
          <select className="select">
            <option>Select Users Type</option>
            <option>internal</option>
            <option>external</option>
          </select>
        </div>

        <div>
          <div className="small-label">Upload CSV to create multiple users</div>
          <input type="file" className="input" />
        </div>
      </div>

      <AdminTable<ImportRow> columns={columns as any} rows={rows} />
    </div>
  )
}