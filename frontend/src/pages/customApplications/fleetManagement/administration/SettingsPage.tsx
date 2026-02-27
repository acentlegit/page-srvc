import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../../../../components/PageHeader';

export default function SettingsPage() {
  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Fleet management settings"
      />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Settings interface coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
