import React from 'react'
import { Box, Typography } from '@mui/material'

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, right, action }: PageHeaderProps) {
  // Use action if provided, otherwise use right (for backward compatibility)
  const actionContent = action || right

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: subtitle ? 1 : 0 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: subtitle ? 0.5 : 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actionContent && (
          <Box sx={{ ml: 'auto' }}>
            {actionContent}
          </Box>
        )}
      </Box>
    </Box>
  )
}