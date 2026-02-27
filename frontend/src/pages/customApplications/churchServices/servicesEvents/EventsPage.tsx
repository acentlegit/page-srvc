import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function EventsPage() {
  return (
    <Box>
      <PageHeader
        title="Events"
        subtitle="Manage church events"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Events management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
