import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function InspectionsPage() {
  return (
    <Box>
      <PageHeader
        title="Inspections"
        subtitle="Manage vehicle inspections"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Inspections interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
