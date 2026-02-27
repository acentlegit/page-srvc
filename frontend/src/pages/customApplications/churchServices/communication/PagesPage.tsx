import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function PagesPage() {
  return (
    <Box>
      <PageHeader
        title="Pages"
        subtitle="Manage church pages"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Pages management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
