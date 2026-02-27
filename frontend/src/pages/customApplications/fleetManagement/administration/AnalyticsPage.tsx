import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function AnalyticsPage() {
  return (
    <Box>
      <PageHeader
        title="Analytics"
        subtitle="Fleet management analytics and insights"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Analytics interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
