import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function TithesPage() {
  return (
    <Box>
      <PageHeader
        title="Tithes"
        subtitle="Manage church tithes"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Tithes management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
