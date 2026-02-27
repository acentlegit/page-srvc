import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function FuneralsPage() {
  return (
    <Box>
      <PageHeader
        title="Funerals"
        subtitle="Manage funeral records"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Funerals management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
