import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import {
  Description,
  Assessment,
  Build,
  List as ListIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';

export default function CitizenServicesDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Intake Forms',
      description: 'Fill out the complete intake form with all 9 steps (Consent, Basic Info, Household, Services, etc.)',
      icon: <Description />,
      path: '/custom-applications/citizen-services-1/intake-forms/new',
      color: '#1976d2',
    },
    {
      title: 'View Submissions',
      description: 'View and manage all submitted intake forms',
      icon: <ListIcon />,
      path: '/custom-applications/citizen-services-1/intake-forms',
      color: '#1976d2',
    },
    {
      title: 'Analytics Dashboard',
      description: 'View statistics, program sign-ups, and demographics',
      icon: <Assessment />,
      path: '/custom-applications/citizen-services-1/analytics',
      color: '#1976d2',
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Citizen Services"
        subtitle="Manage intake forms, submissions, and analytics"
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${item.color}20`,
                      color: item.color,
                      mr: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {item.description}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                  sx={{ bgcolor: item.color, mt: 'auto' }}
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
