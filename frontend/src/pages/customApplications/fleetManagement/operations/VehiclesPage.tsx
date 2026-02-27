import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function VehiclesPage() {
  return (
    <Box>
      <PageHeader
        title="Vehicles"
        subtitle="Manage fleet vehicles"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Vehicles management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
