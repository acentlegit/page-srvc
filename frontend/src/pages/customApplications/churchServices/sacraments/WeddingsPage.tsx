import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function WeddingsPage() {
  return (
    <Box>
      <PageHeader
        title="Weddings"
        subtitle="Manage wedding records"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Weddings management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
