import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'

type Row = {
  name: string
  title: string
  message: string
  eventStatus: string
  actions: string
}

const FlagSelectRow = ({
  color,
  value,
  onChange,
}: {
  color: string
  value: string
  onChange: (v: string) => void
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
    <span style={{ width: 14, height: 14, borderRadius: '50%', background: color, display: 'inline-block' }} />
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Flag Names</option>
      <option value="paused">paused</option>
      <option value="stopped">stopped</option>
      <option value="offline">offline</option>
      <option value="online">online</option>
      <option value="moving">moving</option>
      <option value="on duty">on duty</option>
      <option value="speeding">speeding</option>
    </select>
  </div>
)

export default function BeamLocateSettingsPage() {
  const [cad, setCad] = useState('CAD')
  const [project, setProject] = useState('')

  const [userFlags, setUserFlags] = useState({
    yellow: 'paused',
    blue: '',
    gray: 'offline',
    green: 'online',
    purple: '',
    red: 'on duty',
  })

  const [assetFlags, setAssetFlags] = useState({
    yellow: 'stopped',
    blue: '',
    gray: 'offline',
    green: 'moving',
    purple: '',
    red: 'speeding',
  })

  const [rows, setRows] = useState<Row[]>([
    { name: 'start', title: 'Start', message: '', eventStatus: '', actions: '' },
    { name: 'stop', title: 'Stop', message: '', eventStatus: '', actions: '' },
    { name: 'cancel', title: 'Cancel', message: '', eventStatus: '', actions: '' },
  ])

  const updateRow = (idx: number, key: keyof Row, value: string) => {
    const copy = [...rows]
    copy[idx] = { ...copy[idx], [key]: value }
    setRows(copy)
  }

  return (
    <div className="card">
      <PageHeader title="BeamLocate Settings" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 30 }}>
        <div>
          <select className="select" value={cad} onChange={(e) => setCad(e.target.value)}>
            <option>CAD</option>
            <option>Other</option>
          </select>

          <select
            className="select"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            style={{ marginTop: 10 }}
          >
            <option value="">Select Project</option>
            <option value="proj1">Project 1</option>
            <option value="proj2">Project 2</option>
          </select>

          <button className="btn btn-secondary" style={{ marginTop: 12 }}>
            Add Tag
          </button>
        </div>

        <div>
          <h4 style={{ margin: 0, marginBottom: 10 }}>Configure User Flags:</h4>
          <FlagSelectRow color="orange" value={userFlags.yellow} onChange={(v) => setUserFlags((p) => ({ ...p, yellow: v }))} />
          <FlagSelectRow color="dodgerblue" value={userFlags.blue} onChange={(v) => setUserFlags((p) => ({ ...p, blue: v }))} />
          <FlagSelectRow color="gray" value={userFlags.gray} onChange={(v) => setUserFlags((p) => ({ ...p, gray: v }))} />
          <FlagSelectRow color="limegreen" value={userFlags.green} onChange={(v) => setUserFlags((p) => ({ ...p, green: v }))} />
          <FlagSelectRow color="purple" value={userFlags.purple} onChange={(v) => setUserFlags((p) => ({ ...p, purple: v }))} />
          <FlagSelectRow color="red" value={userFlags.red} onChange={(v) => setUserFlags((p) => ({ ...p, red: v }))} />
        </div>

        <div>
          <h4 style={{ margin: 0, marginBottom: 10 }}>Configure Asset Flags:</h4>
          <FlagSelectRow color="orange" value={assetFlags.yellow} onChange={(v) => setAssetFlags((p) => ({ ...p, yellow: v }))} />
          <FlagSelectRow color="dodgerblue" value={assetFlags.blue} onChange={(v) => setAssetFlags((p) => ({ ...p, blue: v }))} />
          <FlagSelectRow color="gray" value={assetFlags.gray} onChange={(v) => setAssetFlags((p) => ({ ...p, gray: v }))} />
          <FlagSelectRow color="limegreen" value={assetFlags.green} onChange={(v) => setAssetFlags((p) => ({ ...p, green: v }))} />
          <FlagSelectRow color="purple" value={assetFlags.purple} onChange={(v) => setAssetFlags((p) => ({ ...p, purple: v }))} />
          <FlagSelectRow color="red" value={assetFlags.red} onChange={(v) => setAssetFlags((p) => ({ ...p, red: v }))} />
        </div>
      </div>

      <hr className="sep" />

      {rows.map((row, idx) => (
        <div
          key={idx}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr 90px',
            gap: 14,
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <div>
            <div className="small-label">Name</div>
            <input className="input" value={row.name} onChange={(e) => updateRow(idx, 'name', e.target.value)} />
          </div>

          <div>
            <div className="small-label">Title</div>
            <input className="input" value={row.title} onChange={(e) => updateRow(idx, 'title', e.target.value)} />
          </div>

          <div>
            <div className="small-label">Message</div>
            <input className="input" value={row.message} onChange={(e) => updateRow(idx, 'message', e.target.value)} />
          </div>

          <div>
            <div className="small-label">Event Status</div>
            <select className="select" value={row.eventStatus} onChange={(e) => updateRow(idx, 'eventStatus', e.target.value)}>
              <option value="">Event Status</option>
              <option value="created">created</option>
              <option value="started">started</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          <div>
            <div className="small-label">Actions</div>
            <select className="select" value={row.actions} onChange={(e) => updateRow(idx, 'actions', e.target.value)}>
              <option value="">Actions</option>
              <option value="notify">notify</option>
              <option value="broadcast">broadcast</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={circleBtn}>✓</button>
            <button style={circleBtn}>×</button>
          </div>
        </div>
      ))}

      <button
        className="btn btn-secondary"
        onClick={() =>
          setRows((p) => [...p, { name: '', title: '', message: '', eventStatus: '', actions: '' }])
        }
      >
        Add Auto Selection Fields
      </button>
    </div>
  )
}

const circleBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  background: '#eee',
  fontWeight: 700,
}