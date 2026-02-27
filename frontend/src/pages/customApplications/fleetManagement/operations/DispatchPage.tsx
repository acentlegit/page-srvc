import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function DispatchPage() {
  return (
    <Box>
      <PageHeader
        title="Dispatch"
        subtitle="Manage fleet dispatch operations"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Dispatch interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
