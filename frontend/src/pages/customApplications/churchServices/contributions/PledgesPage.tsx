import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function PledgesPage() {
  return (
    <Box>
      <PageHeader
        title="Pledges"
        subtitle="Manage church pledges"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Pledges management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
