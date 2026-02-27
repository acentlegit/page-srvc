import React, { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { sidebarData, NavItem, getCustomerSidebarData, getStaffSidebarData } from './sidebarData'

function isActivePath(current: string, path?: string) {
  if (!path) return false
  return current === path
}

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const [open, setOpen] = useState<Record<string, boolean>>({
    Events: true,
    People: true,
    Settings: true,
    Customer: true,
    'Custom Applications': true,
    'Citizen Services': true,
    'Citizen Services-Case Management': true,
    'Citizen Services-Housing Assistance': true,
    'Citizen Services-Workforce Development': true,
    'Fleet Management': true,
    'Fleet Management-Operations': true,
    'Fleet Management-Maintenance': true,
    'Fleet Management-Compliance': true,
    'Fleet Management-Monitoring': true,
    'Fleet Management-Administration': true,
    'Church Services': true,
    'Church Services-Ministry Management': true,
    'Church Services-Services & Events': true,
    'Church Services-Contributions': true,
    'Church Services-Sacraments': true,
    'Church Services-Communication': true,
    'Church Services-Administration': true,
  })

  const current = location.pathname
  
  // Get sidebar data based on user role
  const menuData = useMemo(() => {
    if (user?.role === 'customer') {
      return getCustomerSidebarData()
    } else if (user?.role === 'staff') {
      return getStaffSidebarData()
    } else {
      return sidebarData // Admin or default
    }
  }, [user?.role])
  
  const menuTitle = useMemo(() => {
    if (user?.role === 'customer') return 'Customer Menu'
    if (user?.role === 'staff') return 'Staff Menu'
    return 'Admin Menu'
  }, [user?.role])

  // Recursive helper to render nested children
  const renderChildItem = (child: NavItem, parentLabel: string, depth: number = 0): React.ReactNode => {
    const hasChildren = child.children && Array.isArray(child.children) && child.children.length > 0
    const hasPath = child.path && child.path.length > 0
    const itemKey = child.path || `${parentLabel}-${child.label}-${depth}`
    
    // If it has children, render as dropdown
    if (hasChildren) {
      // Use parentLabel-child.label for the key (e.g., "Citizen Services-Case Management")
      const childKey = `${parentLabel}-${child.label}`
      const childIsOpen = open[childKey] ?? false
      
      // Debug log
      if (child.label === 'Case Management') {
        console.log('Case Management dropdown (recursive):', { 
          parentLabel, 
          childLabel: child.label, 
          childKey, 
          hasChildren, 
          childIsOpen 
        })
      }
      
      return (
        <div key={itemKey}>
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Dropdown clicked:', child.label, 'Parent:', parentLabel, 'Key:', childKey, 'Current state:', childIsOpen)
              setOpen((p) => ({ ...p, [childKey]: !childIsOpen }))
            }}
            style={{
              padding: '10px 16px 10px 28px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 6,
              margin: '4px 10px',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span>{child.label}</span>
            <span 
              style={{ 
                color: '#999', 
                fontSize: '16px', 
                fontWeight: 'normal',
                marginLeft: '8px',
                userSelect: 'none',
              }}
              title={childIsOpen ? 'Click to collapse' : 'Click to expand'}
            >
              {childIsOpen ? '▾' : '▸'}
            </span>
          </div>
          {childIsOpen && (
            <div style={{ paddingBottom: 4 }}>
              {child.children!.map((grandchild, grandchildIndex) => {
                // Recursively render nested children
                if (grandchild.children && grandchild.children.length > 0) {
                  return renderChildItem(grandchild, child.label, depth + 1)
                }
                // Regular link
                return (
                  <NavLink
                    key={grandchild.path || `${childKey}-${grandchild.label}-${grandchildIndex}`}
                    to={grandchild.path!}
                    style={({ isActive }) => ({
                      display: 'block',
                      padding: '8px 16px 8px 44px',
                      textDecoration: 'none',
                      color: isActive ? '#fff' : '#2c3e50',
                      background: isActive ? 'var(--brand)' : 'transparent',
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: 6,
                      margin: '2px 10px',
                      fontSize: '0.9em',
                    })}
                  >
                    {grandchild.label}
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>
      )
    }
    
    // Regular child item (must have a path AND no children)
    if (hasPath && !hasChildren && child.path) {
      return (
        <NavLink
          key={itemKey}
          to={child.path}
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
          {child.label}
        </NavLink>
      )
    }
    
    // If no path and no children, don't render
    return null
  }

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
              {item.children.map((c, index) => renderChildItem(c, item.label, 0))}
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
      <div style={{ padding: 16, fontWeight: 800, color: 'var(--brand)' }}>{menuTitle}</div>
      {menuData.map(renderItem)}
    </div>
  )
}