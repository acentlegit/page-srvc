import React from 'react'
import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'

export type Column<T> = { key: keyof T; label: string }

export default function AdminTable<T extends Record<string, any>>({
  columns,
  rows,
  onEdit,
  onDelete,
  onView,
}: {
  columns: Column<T>[]
  rows: T[]
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onView?: (row: T) => void
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e6e6e6' }}>
      <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
        <thead style={{ background: 'var(--brand)', color: '#fff' }}>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} align="left" style={{ fontWeight: 700, fontSize: 13 }}>
                {col.label}
              </th>
            ))}
            <th align="center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr 
              key={idx} 
              style={{ 
                borderBottom: '1px solid #eee',
                cursor: onView ? 'pointer' : 'default'
              }}
              onClick={() => onView?.(row)}
              onMouseEnter={(e) => {
                if (onView) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {columns.map((col) => (
                <td key={String(col.key)} style={{ fontSize: 13 }}>
                  {String(row[col.key] ?? '')}
                </td>
              ))}
              <td align="center" onClick={(e) => e.stopPropagation()}>
                <IconButton size="small" onClick={() => onEdit?.(row)} disabled={!onEdit} title="Edit Page">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete?.(row)} disabled={!onDelete} title="Delete Page">
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onView?.(row)} disabled={!onView} title="View Page & Chat">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}