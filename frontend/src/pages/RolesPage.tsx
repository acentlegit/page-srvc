import React from 'react'
import PageHeader from '../components/PageHeader'

type RoleRow = {
  name: string
  permissions: string[]
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
}

export default function RolesPage() {
  const rows: RoleRow[] = [
    { name: 'admin', permissions: ['admin', 'cad', 'live', 'onMove'] },
    { name: 'dispatcher', permissions: ['live'] },
    { name: 'manager', permissions: ['cad', 'onMove', 'admin'] },
    { name: 'responder', permissions: [] },
    { name: 'contractor', permissions: ['analytics', 'live', 'cad'] },
    { name: 'inactive', permissions: [] },
    { name: 'seller agent', permissions: [] },
    { name: 'buyer agent', permissions: [] },
    { name: 'real estate broker', permissions: [] },
  ]

  return (
    <div className="card">
      <PageHeader
        title="Roles"
        right={<button className="btn">Add Role</button>}
      />

      <div style={{ overflow: 'auto' }}>
        <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--brand)', color: '#fff' }}>
            <tr>
              <th align="left">Name</th>
              <th align="left">Permissions</th>
              <th align="center">Bio</th>
              <th align="center">Signup</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} style={{ borderBottom: '1px solid #eee' }}>
                <td>{row.name}</td>
                <td>
                  {row.permissions.length ? (
                    row.permissions.map((p) => (
                      <span key={p} style={tagStyle}>
                        {p}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#999' }}>Permissions</span>
                  )}
                  <select className="select" style={{ width: 140, marginTop: 6 }}>
                    <option>Permissions</option>
                    <option>analytics</option>
                    <option>live</option>
                    <option>cad</option>
                    <option>onMove</option>
                    <option>admin</option>
                  </select>
                </td>
                <td align="center">
                  <button className="btn btn-secondary">Extended Bio</button>
                </td>
                <td align="center">
                  <button className="btn">Signup Form</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
