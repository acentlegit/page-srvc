import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function InsurancePage() {
  return (
    <Box>
      <PageHeader
        title="Insurance"
        subtitle="Manage vehicle insurance"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Insurance interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
