import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { Add, Edit, Delete, SmartToy } from '@mui/icons-material'

interface AIAgent {
  id: string
  name: string
  description: string
  systemPrompt: string
  enabled: boolean
  assignedPages: string[]
  createdAt: string
}

export default function AIAgentManagementPage() {
  const { user } = useAuth()
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null)
  const [formData, setFormData] = useState<Partial<AIAgent>>({
    name: '',
    description: '',
    systemPrompt: '',
    enabled: true,
    assignedPages: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call
      // const fetchedAgents = await aiAgentsApi.getAll()
      // setAgents(fetchedAgents)

      // Mock data for now
      setAgents([])
    } catch (err) {
      console.error('Failed to fetch AI agents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = () => {
    setEditingAgent(null)
    setFormData({
      name: '',
      description: '',
      systemPrompt: '',
      enabled: true,
      assignedPages: [],
    })
    setOpenDialog(true)
  }

  const handleEditAgent = (agent: AIAgent) => {
    setEditingAgent(agent)
    setFormData(agent)
    setOpenDialog(true)
  }

  const handleSaveAgent = async () => {
    try {
      // TODO: Implement API call
      // if (editingAgent) {
      //   await aiAgentsApi.update(editingAgent.id, formData)
      // } else {
      //   await aiAgentsApi.create(formData)
      // }
      await fetchAgents()
      setOpenDialog(false)
    } catch (err) {
      console.error('Failed to save AI agent:', err)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!window.confirm('Are you sure you want to delete this AI agent?')) return

    try {
      // TODO: Implement API call
      // await aiAgentsApi.delete(agentId)
      await fetchAgents()
    } catch (err) {
      console.error('Failed to delete AI agent:', err)
    }
  }

  const handleToggleEnabled = async (agentId: string, enabled: boolean) => {
    try {
      // TODO: Implement API call
      // await aiAgentsApi.update(agentId, { enabled })
      await fetchAgents()
    } catch (err) {
      console.error('Failed to toggle AI agent:', err)
    }
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: 20 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            AI Agent Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage AI agents for automated customer interactions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateAgent}
        >
          Create AI Agent
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned Pages</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading AI agents...
                </TableCell>
              </TableRow>
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No AI agents created yet. Create your first AI agent to get started.
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SmartToy color="primary" />
                      {agent.name}
                    </Box>
                  </TableCell>
                  <TableCell>{agent.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={agent.enabled ? 'Enabled' : 'Disabled'}
                      size="small"
                      color={agent.enabled ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{agent.assignedPages.length} pages</TableCell>
                  <TableCell>{new Date(agent.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agent.enabled}
                            onChange={(e) => handleToggleEnabled(agent.id, e.target.checked)}
                            size="small"
                          />
                        }
                        label=""
                      />
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEditAgent(agent)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Delete />}
                        color="error"
                        onClick={() => handleDeleteAgent(agent.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Agent Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAgent ? 'Edit AI Agent' : 'Create New AI Agent'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Agent Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Customer Support Bot, FAQ Assistant"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                placeholder="Brief description of the agent's purpose"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="System Prompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                multiline
                rows={6}
                required
                placeholder="Define the AI agent's behavior, personality, and response style..."
                helperText="This prompt defines how the AI agent will interact with customers"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled ?? true}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                }
                label="Enable this AI agent"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAgent} variant="contained">
            {editingAgent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
