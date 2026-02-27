import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function PartsInventoryPage() {
  return (
    <Box>
      <PageHeader
        title="Parts Inventory"
        subtitle="Manage vehicle parts inventory"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Parts inventory interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
