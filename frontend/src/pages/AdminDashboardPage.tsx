import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

interface ServiceConsumptionRow {
  organizationName: string;
  numberOfPages: number;
  chatMessagesPerDay: number;
  rate: number;
  totalCost: number;
}

export default function AdminDashboardPage() {
  const [serviceData, setServiceData] = useState<ServiceConsumptionRow[]>([
    {
      organizationName: 'City Council',
      numberOfPages: 25,
      chatMessagesPerDay: 4200,
      rate: 0.05,
      totalCost: 210,
    },
    {
      organizationName: 'Hope Church',
      numberOfPages: 12,
      chatMessagesPerDay: 1850,
      rate: 0.04,
      totalCost: 74,
    },
    {
      organizationName: 'Metro Fleet',
      numberOfPages: 40,
      chatMessagesPerDay: 8000,
      rate: 0.05,
      totalCost: 400,
    },
  ]);

  const totalRevenue = serviceData.reduce((sum, row) => sum + row.totalCost, 0);
  const totalPages = serviceData.reduce((sum, row) => sum + row.numberOfPages, 0);
  const totalMessages = serviceData.reduce((sum, row) => sum + row.chatMessagesPerDay, 0);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2)}`;
  };

  useEffect(() => {
    document.title = 'beamLive 3.0 Open API'
  }, [])

  return (
    <Box>
      <PageHeader
        title="beamLive 3.0 Open API"
        subtitle="Platform analytics, service consumption, and revenue reports"
      />

      {/* Platform Analytics Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="h5" component="h2">
              Platform Analytics
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Organizations
                  </Typography>
                  <Typography variant="h4" component="div">
                    {serviceData.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Pages
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(totalPages)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Daily Messages
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(totalMessages)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Service Consumption Report Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="h5" component="h2">
              Final Report Structure (5 Columns)
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Organization Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Number of Pages</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    Chat Messages
                    <br />
                    <Typography variant="caption" component="span">
                      (Vol/Day)
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rate (w)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serviceData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: '#fafafa' },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row.organizationName}
                    </TableCell>
                    <TableCell>{row.numberOfPages}</TableCell>
                    <TableCell>{formatNumber(row.chatMessagesPerDay)}</TableCell>
                    <TableCell>{row.rate.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatCurrency(row.totalCost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Revenue Report Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="h5" component="h2">
              Revenue Report
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Daily Revenue
                  </Typography>
                  <Typography variant="h5" component="div" color="primary" sx={{ fontWeight: 700 }}>
                    {formatCurrency(totalRevenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Estimated Monthly Revenue
                  </Typography>
                  <Typography variant="h5" component="div" color="primary" sx={{ fontWeight: 700 }}>
                    {formatCurrency(totalRevenue * 30)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    (Based on daily volume × 30 days)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Revenue Breakdown by Organization:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {serviceData.map((row, index) => (
                <Chip
                  key={index}
                  label={`${row.organizationName}: ${formatCurrency(row.totalCost)}`}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
