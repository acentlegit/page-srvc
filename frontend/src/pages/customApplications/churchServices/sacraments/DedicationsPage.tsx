import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function DedicationsPage() {
  return (
    <Box>
      <PageHeader
        title="Dedications"
        subtitle="Manage dedication records"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Dedications management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
