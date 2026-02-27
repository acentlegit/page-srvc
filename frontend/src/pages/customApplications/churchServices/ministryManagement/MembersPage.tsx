import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function MembersPage() {
  return (
    <Box>
      <PageHeader
        title="Members"
        subtitle="Manage church members"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Members management interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
