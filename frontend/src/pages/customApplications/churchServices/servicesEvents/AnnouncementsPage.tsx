import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function AnnouncementsPage() {
  return (
    <Box>
      <PageHeader
        title="Announcements"
        subtitle="Manage church announcements"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Announcements interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
