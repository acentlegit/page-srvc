import React from 'react';
import { Box, Card, CardContent, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Apps,
  FolderSpecial,
  Description,
} from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';

export default function ApplicationCustomizationDashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Custom Applications',
      description: 'Manage and customize applications for customers',
      icon: <Apps sx={{ fontSize: 48, color: '#1976d2' }} />,
      path: '/website-customization/applications',
      color: '#1976d2',
    },
    {
      title: 'Projects',
      description: 'Create projects within custom applications',
      icon: <FolderSpecial sx={{ fontSize: 48, color: '#ed6c02' }} />,
      path: '/website-customization/projects',
      color: '#ed6c02',
    },
    {
      title: 'Intake Forms',
      description: 'Manage intake forms for applications',
      icon: <Description sx={{ fontSize: 48, color: '#9c27b0' }} />,
      path: '/website-customization/intake-forms',
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Website Customization"
        subtitle="Build and customize applications for customers"
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: feature.color,
                    '&:hover': { bgcolor: feature.color, opacity: 0.9 },
                  }}
                  fullWidth
                >
                  OPEN
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
