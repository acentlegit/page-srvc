import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function GroupsPage() {
  return (
    <Box>
      <PageHeader
        title="Groups / Ministries"
        subtitle="Manage church groups and ministries"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Groups and ministries management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
