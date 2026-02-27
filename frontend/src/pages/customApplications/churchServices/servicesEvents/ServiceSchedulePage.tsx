import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function ServiceSchedulePage() {
  return (
    <Box>
      <PageHeader
        title="Service Schedule"
        subtitle="Manage church service schedule"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Service schedule interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
