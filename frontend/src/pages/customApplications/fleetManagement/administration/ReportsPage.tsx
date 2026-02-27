import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function ReportsPage() {
  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate fleet management reports"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Reports interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
