import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function GivingReportsPage() {
  return (
    <Box>
      <PageHeader
        title="Giving Reports"
        subtitle="View giving reports and analytics"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Giving reports interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
