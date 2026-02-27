import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function WorkOrdersPage() {
  return (
    <Box>
      <PageHeader
        title="Work Orders"
        subtitle="Manage maintenance work orders"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Work orders interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
