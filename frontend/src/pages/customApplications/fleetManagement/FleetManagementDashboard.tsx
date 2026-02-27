import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { DirectionsCar, LocalShipping, Assessment } from '@mui/icons-material';
import PageHeader from '../../../components/PageHeader';

export default function FleetManagementDashboard() {
  return (
    <Box>
      <PageHeader
        title="Fleet Management"
        subtitle="Manage your fleet operations, maintenance, and compliance"
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage vehicles, drivers, trips, routes, and dispatch
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Maintenance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track service schedules, work orders, and repairs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Compliance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage inspections, insurance, and registrations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
