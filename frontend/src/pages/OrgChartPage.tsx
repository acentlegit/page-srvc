import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'

type OrgRow = {
  title: string
  people: string
}

export default function OrgChartPage() {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'people', label: 'People' },
  ] as const

  const [rows, setRows] = useState<OrgRow[]>([])

  return (
    <div className="card">
      <PageHeader
        title="Organization"
        right={<input className="input" style={{ width: 220 }} placeholder="Search" />}
      />

      <AdminTable<OrgRow> columns={columns as any} rows={rows} />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
        {rows.map((row) => (
          <div
            key={row.title}
            style={{
              width: 150,
              height: 70,
              border: '1px solid #cfe3ea',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#eef6f8',
              textAlign: 'center',
              fontSize: 12,
              padding: 6,
            }}
          >
            {row.title}
          </div>
        ))}
      </div>
    </div>
  )
}
