import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function BaptismsPage() {
  return (
    <Box>
      <PageHeader
        title="Baptisms"
        subtitle="Manage baptism records"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Baptisms management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
