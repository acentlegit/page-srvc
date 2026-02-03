import React from 'react'

export default function Topbar() {
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
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--brand)' }}>
        beam
      </div>
      <div style={{ marginLeft: 'auto', color: '#999' }}>Admin Panel</div>
    </div>
  )
}