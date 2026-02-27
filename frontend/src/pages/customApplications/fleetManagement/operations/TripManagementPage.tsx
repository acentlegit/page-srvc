import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function TripManagementPage() {
  return (
    <Box>
      <PageHeader
        title="Trip Management"
        subtitle="Manage fleet trips"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Trip management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
