import React from 'react'

export default function PageHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div style={{ marginLeft: 'auto' }}>{right}</div>
    </div>
  )
}