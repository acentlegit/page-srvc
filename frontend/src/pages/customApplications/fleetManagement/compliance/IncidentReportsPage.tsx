import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function IncidentReportsPage() {
  return (
    <Box>
      <PageHeader
        title="Incident Reports"
        subtitle="Manage incident reports"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Incident reports interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
