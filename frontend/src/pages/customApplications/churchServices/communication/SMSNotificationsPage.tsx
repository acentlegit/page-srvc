import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function SMSNotificationsPage() {
  return (
    <Box>
      <PageHeader
        title="SMS Notifications"
        subtitle="Manage SMS notifications"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>SMS notifications interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
