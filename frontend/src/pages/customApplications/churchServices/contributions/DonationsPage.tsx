import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function DonationsPage() {
  return (
    <Box>
      <PageHeader
        title="Donations"
        subtitle="Manage church donations"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Donations management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
