import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function MileageLogsPage() {
  return (
    <Box>
      <PageHeader
        title="Mileage Logs"
        subtitle="Track vehicle mileage"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Mileage logs interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
