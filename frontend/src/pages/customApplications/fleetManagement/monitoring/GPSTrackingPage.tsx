import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function GPSTrackingPage() {
  return (
    <Box>
      <PageHeader
        title="GPS Tracking"
        subtitle="Track vehicles in real-time"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>GPS tracking interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
