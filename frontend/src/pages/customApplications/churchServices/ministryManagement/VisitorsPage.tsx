import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function VisitorsPage() {
  return (
    <Box>
      <PageHeader
        title="Visitors"
        subtitle="Manage church visitors"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Visitors management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
