import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function RepairsHistoryPage() {
  return (
    <Box>
      <PageHeader
        title="Repairs History"
        subtitle="View vehicle repair history"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Repairs history interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
