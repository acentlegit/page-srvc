import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, background: 'var(--bg)', overflow: 'auto' }}>
        <Topbar />
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}