import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function RoutePlanningPage() {
  return (
    <Box>
      <PageHeader
        title="Route Planning"
        subtitle="Plan and optimize routes"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Route planning interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
