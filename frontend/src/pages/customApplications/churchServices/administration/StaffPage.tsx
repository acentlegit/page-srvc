import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function StaffPage() {
  return (
    <Box>
      <PageHeader
        title="Staff"
        subtitle="Manage church staff"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Staff management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
