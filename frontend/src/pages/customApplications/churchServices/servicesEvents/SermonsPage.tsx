import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function SermonsPage() {
  return (
    <Box>
      <PageHeader
        title="Sermons"
        subtitle="Manage church sermons"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Sermons management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
