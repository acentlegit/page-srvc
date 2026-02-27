import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function FuelLogsPage() {
  return (
    <Box>
      <PageHeader
        title="Fuel Logs"
        subtitle="Track fuel consumption"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Fuel logs interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
