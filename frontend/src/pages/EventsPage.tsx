import React, { useEffect, useMemo, useState } from 'react'
import { IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PageHeader from '../components/PageHeader'
import Legend from '../components/Legend'
import AdminTable from '../components/AdminTable'
import { eventsApi, Event } from '../api/apiClient'

type EventRow = {
  status: string
  flag: string
  name: string
  projects: string
  address: string
  state: string
  city: string
  country: string
  zip: string
  createdAt: string
  updatedAt: string
}

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('Action')
  const [statusDraft, setStatusDraft] = useState<Set<string>>(new Set())
  const [statusApplied, setStatusApplied] = useState<Set<string>>(new Set())
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [projectOwner, setProjectOwner] = useState('')
  const [projectStatus, setProjectStatus] = useState('Active')
  const [projectStart, setProjectStart] = useState('')
  const [projectEnd, setProjectEnd] = useState('')
  const [projects, setProjects] = useState<
    Array<{ name: string; description: string; owner?: string; status?: string; startDate?: string; endDate?: string }>
  >([])
  const [rows, setRows] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const legend = [
    { label: 'escalated', color: 'red' },
    { label: 'created', color: 'purple' },
    { label: 'assigned', color: 'orange' },
    { label: 'started', color: 'dodgerblue' },
    { label: 'completed', color: 'limegreen' },
    { label: 'processed', color: 'gray' },
    { label: 'cancelled', color: 'black' },
    { label: 'advance', color: 'brown' },
  ]

  const columns = [
    { key: 'status', label: 'Status' },
    { key: 'flag', label: 'Flag' },
    { key: 'name', label: 'Name' },
    { key: 'projects', label: 'Projects' },
    { key: 'address', label: 'Address' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'zip', label: 'Zip Code' },
    { key: 'createdAt', label: 'createdAt' },
    { key: 'updatedAt', label: 'updatedAt' },
  ] as const


  // Load events from REST API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        const events = await eventsApi.list()
        const mappedRows: EventRow[] = events.map((event: Event) => ({
          status: event.status,
          flag: event.flag,
          name: event.name,
          projects: event.projects,
          address: event.address,
          state: event.state,
          city: event.city,
          country: event.country,
          zip: event.zip,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        }))
        setRows(mappedRows) // No default seed data - show empty if no events
      } catch (err: any) {
        console.error('Failed to fetch events:', err)
        setRows([]) // No default seed data - show empty list
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Load projects from REST API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await eventsApi.listProjects()
        setProjects(projectsData)
      } catch (err: any) {
        console.error('Failed to fetch projects:', err)
        setProjects([]) // Show empty if API fails
      }
    }
    fetchProjects()
  }, [])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const statusFilter = statusApplied.size ? statusApplied : null
    const bySearch = rows.filter((row) =>
      [row.name, row.projects, row.address, row.city, row.state, row.country, row.zip]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    )
    if (!statusFilter) return query ? bySearch : rows
    return (query ? bySearch : rows).filter((row) => statusFilter.has(row.status))
  }, [rows, search, statusApplied])

  const toggleStatus = (label: string) => {
    setStatusDraft((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const applyStatusFilter = () => {
    setStatusApplied(new Set(statusDraft))
  }

  const addEvent = async () => {
    const title = window.prompt('Event name', '')
    if (!title) return
    const project = window.prompt('Project', 'default-project') ?? 'default-project'
    const address = window.prompt('Address', 'Address') ?? 'Address'
    try {
      const newEvent = await eventsApi.create({
        status: 'created',
        flag: '🟠',
        name: title,
        projects: project,
        address,
        state: '',
        city: '',
        country: '',
        zip: '',
      })
      const newRow: EventRow = {
        status: newEvent.status,
        flag: newEvent.flag,
        name: newEvent.name,
        projects: newEvent.projects,
        address: newEvent.address,
        state: newEvent.state,
        city: newEvent.city,
        country: newEvent.country,
        zip: newEvent.zip,
        createdAt: newEvent.createdAt,
        updatedAt: newEvent.updatedAt,
      }
      setRows((prev) => [newRow, ...prev])
    } catch (err: any) {
      console.error('Failed to create event:', err)
      window.alert('Failed to create event: ' + (err.message || 'Unknown error'))
    }
  }

  const createProject = async () => {
    const trimmedName = projectName.trim()
    if (!trimmedName) {
      window.alert('Please enter a project name.')
      return
    }
    try {
      const newProject = await eventsApi.createProject({
        name: trimmedName,
        description: projectDesc.trim(),
        owner: projectOwner.trim(),
        status: projectStatus,
        startDate: projectStart,
        endDate: projectEnd,
      })
      setProjects((prev) => [newProject, ...prev])
      setProjectName('')
      setProjectDesc('')
      setProjectOwner('')
      setProjectStatus('Active')
      setProjectStart('')
      setProjectEnd('')
      setShowProjectForm(false)
      window.alert('Project created.')
    } catch (err: any) {
      console.error('Failed to create project:', err)
      window.alert('Failed to create project: ' + (err.message || 'Unknown error'))
    }
  }

  const exportRows = (exportRowsList: EventRow[]) => {
    const header = columns.map((c) => c.label).join(',')
    const lines = exportRowsList.map((row) =>
      [
        row.status,
        row.flag,
        row.name,
        row.projects,
        row.address,
        row.state,
        row.city,
        row.country,
        row.zip,
        row.createdAt,
        row.updatedAt,
      ]
        .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
        .join(','),
    )
    const csv = [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'events-export.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleProjectView = (project: { name: string; description: string; owner?: string; status?: string; startDate?: string; endDate?: string }) => {
    window.alert(
      `Project: ${project.name}\nDescription: ${project.description}\nOwner: ${project.owner ?? ''}\nStatus: ${
        project.status ?? ''
      }\nStart: ${project.startDate ?? ''}\nEnd: ${project.endDate ?? ''}`,
    )
  }

  const handleProjectEdit = (project: { name: string }) => {
    const nextName = window.prompt('Project name', project.name)
    if (!nextName) return
    const next = projects.map((p) => (p.name === project.name ? { ...p, name: nextName } : p))
    setProjects(next)
    try {
      localStorage.setItem('projectsList', JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }

  const handleProjectDelete = (project: { name: string }) => {
    const confirmed = window.confirm(`Delete project ${project.name}?`)
    if (!confirmed) return
    const next = projects.filter((p) => p.name !== project.name)
    setProjects(next)
    try {
      localStorage.setItem('projectsList', JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }

  const submitAction = () => {
    if (action === 'Export') {
      exportRows(filteredRows)
      return
    }
    if (action === 'Delete') {
      const confirmed = window.confirm('Delete all filtered events?')
      if (!confirmed) return
      const filteredSet = new Set(filteredRows.map((row) => `${row.name}-${row.createdAt}`))
      setRows((prev) => prev.filter((row) => !filteredSet.has(`${row.name}-${row.createdAt}`)))
      return
    }
    window.alert('Select an action to continue.')
  }

  const handleEventView = (row: EventRow) => {
    window.alert(
      `Event: ${row.name}\nProject: ${row.projects}\nStatus: ${row.status}\nAddress: ${row.address}\nCreated: ${row.createdAt}`,
    )
  }

  const handleEventEdit = (row: EventRow) => {
    const nextStatus = window.prompt('Update status', row.status)
    if (!nextStatus) return
    setRows((prev) =>
      prev.map((r) => (r.createdAt === row.createdAt && r.name === row.name ? { ...r, status: nextStatus } : r)),
    )
  }

  const handleEventDelete = (row: EventRow) => {
    const confirmed = window.confirm(`Delete event "${row.name}"?`)
    if (!confirmed) return
    setRows((prev) => prev.filter((r) => !(r.createdAt === row.createdAt && r.name === row.name)))
  }

  return (
    <div className="card">
      <PageHeader
        title="Events"
        right={
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={addEvent}>
              Add Events
            </button>
            <button className="btn btn-secondary" onClick={() => setShowProjectForm((p) => !p)}>
              Create Project
            </button>
          </div>
        }
      />

      {loading && <div style={{ padding: 16, textAlign: 'center' }}>Loading events...</div>}

      {showProjectForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="small-label">Project Name</div>
              <input
                className="input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
              />
            </div>
            <div>
              <div className="small-label">Description</div>
              <input
                className="input"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Short description"
              />
            </div>
            <div>
              <div className="small-label">Owner</div>
              <input
                className="input"
                value={projectOwner}
                onChange={(e) => setProjectOwner(e.target.value)}
                placeholder="Owner name"
              />
            </div>
            <div>
              <div className="small-label">Status</div>
              <select className="select" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)}>
                <option>Active</option>
                <option>On Hold</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <div className="small-label">Start Date</div>
              <input
                className="input"
                type="date"
                value={projectStart}
                onChange={(e) => setProjectStart(e.target.value)}
              />
            </div>
            <div>
              <div className="small-label">End Date</div>
              <input
                className="input"
                type="date"
                value={projectEnd}
                onChange={(e) => setProjectEnd(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn" onClick={createProject}>
              Submit
            </button>
            <button className="btn btn-secondary" onClick={() => setShowProjectForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Projects</div>
          <div style={{ overflow: 'auto' }}>
            <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--brand)', color: '#fff' }}>
                <tr>
                  <th align="left">Name</th>
                  <th align="left">Description</th>
                  <th align="left">Owner</th>
                  <th align="left">Status</th>
                  <th align="left">Start</th>
                  <th align="left">End</th>
                  <th align="center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, idx) => (
                  <tr key={`${project.name}-${idx}`} style={{ borderBottom: '1px solid #eee' }}>
                    <td>{project.name}</td>
                    <td>{project.description}</td>
                    <td>{project.owner ?? ''}</td>
                    <td>{project.status ?? ''}</td>
                    <td>{project.startDate ?? ''}</td>
                    <td>{project.endDate ?? ''}</td>
                    <td align="center">
                      <IconButton size="small" onClick={() => handleProjectEdit(project)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleProjectDelete(project)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleProjectView(project)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input
              className="input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select" value={action} onChange={(e) => setAction(e.target.value)}>
              <option>Action</option>
              <option>Export</option>
              <option>Delete</option>
            </select>
            <button
              style={{ background: action === 'Action' ? '#ccc' : undefined }}
              className="btn"
              onClick={submitAction}
              disabled={action === 'Action'}
            >
              Submit
            </button>
          </div>

          <AdminTable<EventRow>
            columns={columns as any}
            rows={filteredRows}
            onEdit={handleEventEdit}
            onDelete={handleEventDelete}
            onView={handleEventView}
          />
        </div>

        <div>
          <Legend items={legend} selectedLabels={statusDraft} onToggle={toggleStatus} />
          <button className="btn btn-secondary" style={{ marginTop: 16, width: '100%' }} onClick={applyStatusFilter}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}