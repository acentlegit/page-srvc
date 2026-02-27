import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { crmApi, Lead, Opportunity, Account } from '../api/crm'
import PageHeader from '../components/PageHeader'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function CRMAnalyticsPage() {
  const { user, hasRole } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [fetchedLeads, fetchedOpportunities, fetchedAccounts] = await Promise.all([
        crmApi.getAllLeads(),
        crmApi.getAllOpportunities(),
        crmApi.getAllAccounts(),
      ])
      setLeads(fetchedLeads)
      setOpportunities(fetchedOpportunities)
      setAccounts(fetchedAccounts)
    } catch (err) {
      console.error('Failed to fetch CRM data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Lead status distribution
  const leadStatusData = () => {
    const statusCounts: Record<string, number> = {}
    leads.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1
    })
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }

  // Opportunity stage distribution
  const opportunityStageData = () => {
    const stageCounts: Record<string, number> = {}
    opportunities.forEach(opp => {
      stageCounts[opp.stage] = (stageCounts[opp.stage] || 0) + 1
    })
    return Object.entries(stageCounts).map(([name, value]) => ({ name, value }))
  }

  // Opportunity value by stage
  const opportunityValueData = () => {
    const stageValues: Record<string, number> = {}
    opportunities.forEach(opp => {
      stageValues[opp.stage] = (stageValues[opp.stage] || 0) + opp.value
    })
    return Object.entries(stageValues).map(([name, value]) => ({ name, value }))
  }

  // Conversion rate over time (last 30 days)
  const conversionData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    return last30Days.map(date => {
      const convertedLeads = leads.filter(
        lead => lead.status === 'CONVERTED' && lead.updatedAt?.startsWith(date)
      ).length
      const totalLeads = leads.filter(lead => lead.createdAt.startsWith(date)).length
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        conversions: convertedLeads,
        newLeads: totalLeads,
      }
    })
  }

  // Pipeline value
  const pipelineValue = opportunities
    .filter(opp => !['CLOSED_WON', 'CLOSED_LOST'].includes(opp.stage))
    .reduce((sum, opp) => sum + opp.value, 0)

  // Won value
  const wonValue = opportunities
    .filter(opp => opp.stage === 'CLOSED_WON')
    .reduce((sum, opp) => sum + opp.value, 0)

  // Conversion rate
  const conversionRate = leads.length > 0
    ? ((leads.filter(l => l.status === 'CONVERTED').length / leads.length) * 100).toFixed(1)
    : '0'

  if (loading) {
    return (
      <Container maxWidth="xl" style={{ marginTop: 20, marginBottom: 20 }}>
        <Paper elevation={0} style={{ padding: 24, background: '#fff' }}>
          <Typography>Loading analytics...</Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper elevation={0} style={{ padding: 24, background: '#fff' }}>
        <PageHeader title="Analytics Dashboard" />

        {/* Key Metrics */}
        <Grid container spacing={3} style={{ marginBottom: 32 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Total Leads
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: 'var(--brand)' }}>
                  {leads.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Pipeline Value
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#2196f3' }}>
                  ${pipelineValue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Won Value
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#4caf50' }}>
                  ${wonValue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Conversion Rate
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#ff9800' }}>
                  {conversionRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Lead Status Distribution */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} style={{ padding: 20 }}>
              <Typography variant="h6" style={{ marginBottom: 20 }}>
                Lead Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Opportunity Stage Distribution */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} style={{ padding: 20 }}>
              <Typography variant="h6" style={{ marginBottom: 20 }}>
                Opportunity Stage Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={opportunityStageData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {opportunityStageData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Opportunity Value by Stage */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} style={{ padding: 20 }}>
              <Typography variant="h6" style={{ marginBottom: 20 }}>
                Opportunity Value by Stage
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={opportunityValueData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value']} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Conversion Trend */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} style={{ padding: 20 }}>
              <Typography variant="h6" style={{ marginBottom: 20 }}>
                Conversion Trend (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="conversions" stroke="#8884d8" name="Conversions" />
                  <Line type="monotone" dataKey="newLeads" stroke="#82ca9d" name="New Leads" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}
