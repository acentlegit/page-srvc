import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function EmailCampaignsPage() {
  return (
    <Box>
      <PageHeader
        title="Email Campaigns"
        subtitle="Manage email campaigns"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Email campaigns interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
