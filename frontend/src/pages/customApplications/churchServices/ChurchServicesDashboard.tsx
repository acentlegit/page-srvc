import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import PageHeader from '../../../components/PageHeader';

export default function ChurchServicesDashboard() {
  return (
    <Box>
      <PageHeader
        title="Church Services"
        subtitle="Manage your church ministry, services, contributions, and communications"
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ministry Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage members, visitors, volunteers, and groups
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Services & Events
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schedule services, manage events, sermons, and announcements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contributions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track donations, tithes, pledges, and giving reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
