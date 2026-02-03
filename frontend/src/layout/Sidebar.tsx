import React, { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { sidebarData, NavItem } from './sidebarData'

function isActivePath(current: string, path?: string) {
  if (!path) return false
  return current === path
}

export default function Sidebar() {
  const location = useLocation()
  const [open, setOpen] = useState<Record<string, boolean>>({
    Events: true,
    People: true,
    Settings: true,
  })

  const current = location.pathname

  const renderItem = (item: NavItem) => {
    if (item.children?.length) {
      const isOpen = open[item.label] ?? false
      return (
        <div key={item.label}>
          <div
            onClick={() => setOpen((p) => ({ ...p, [item.label]: !isOpen }))}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{item.label}</span>
            <span style={{ color: '#999' }}>{isOpen ? '▾' : '▸'}</span>
          </div>

          {isOpen && (
            <div style={{ paddingBottom: 8 }}>
              {item.children.map((c) => (
                <NavLink
                  key={c.path}
                  to={c.path!}
                  style={({ isActive }) => ({
                    display: 'block',
                    padding: '10px 16px 10px 28px',
                    textDecoration: 'none',
                    color: isActive ? '#fff' : '#2c3e50',
                    background: isActive ? 'var(--brand)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: 6,
                    margin: '4px 10px',
                  })}
                >
                  {c.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <NavLink
        key={item.path}
        to={item.path!}
        style={{
          display: 'block',
          padding: '12px 16px',
          textDecoration: 'none',
          color: isActivePath(current, item.path) ? '#fff' : '#2c3e50',
          background: isActivePath(current, item.path) ? 'var(--brand)' : 'transparent',
          fontWeight: isActivePath(current, item.path) ? 700 : 500,
        }}
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div style={{ width: 260, background: '#fff', borderRight: '1px solid var(--border)', overflow: 'auto' }}>
      <div style={{ padding: 16, fontWeight: 800, color: 'var(--brand)' }}>Admin Menu</div>
      {sidebarData.map(renderItem)}
    </div>
  )
}