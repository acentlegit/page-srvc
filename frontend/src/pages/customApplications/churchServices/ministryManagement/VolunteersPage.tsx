import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function VolunteersPage() {
  return (
    <Box>
      <PageHeader
        title="Volunteers"
        subtitle="Manage church volunteers"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Volunteers management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
