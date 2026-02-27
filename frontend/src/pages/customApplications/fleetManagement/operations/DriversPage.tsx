import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function DriversPage() {
  return (
    <Box>
      <PageHeader
        title="Drivers"
        subtitle="Manage fleet drivers"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Drivers management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
