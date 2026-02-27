import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function RegistrationsPage() {
  return (
    <Box>
      <PageHeader
        title="Registrations"
        subtitle="Manage vehicle registrations"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Registrations interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
