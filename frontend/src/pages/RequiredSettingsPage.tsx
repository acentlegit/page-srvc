import React from 'react'
import PageHeader from '../components/PageHeader'

export default function RequiredSettingsPage() {
  return (
    <div className="card">
      <PageHeader title="Required Settings" />

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Call Management Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div className="small-label">Account SID</div>
            <input className="input" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Auth Token</div>
            <input className="input" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Workspace SID</div>
            <input className="input" placeholder="WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Workflow SID</div>
            <input className="input" placeholder="WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Online State SID</div>
            <input className="input" placeholder="WAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Offline State SID</div>
            <input className="input" placeholder="WAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Unavailable State SID</div>
            <input className="input" placeholder="WAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Reservation Timeout (seconds)</div>
            <input className="input" placeholder="0" />
          </div>
          <div>
            <div className="small-label">Outgoing Application SID</div>
            <input className="input" placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Phone Number</div>
            <input className="input" placeholder="+1xxxxxxxxxx" />
          </div>
          <div>
            <div className="small-label">Task Timeout (seconds)</div>
            <input className="input" placeholder="0" />
          </div>
          <div>
            <div className="small-label">Call Center Text</div>
            <input className="input" placeholder="Call Center Text" />
          </div>
          <div>
            <div className="small-label">Set Event Priority</div>
            <input className="input" placeholder="0" />
          </div>
          <div>
            <div className="small-label">Who Tags</div>
            <input className="input" placeholder="Who Tags" />
          </div>
        </div>

        <hr className="sep" />

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Sharing event with</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="shareEvent" defaultChecked />
              One Call Taker
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="shareEvent" />
              All Call Takers
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="shareEvent" />
              Open
            </label>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" />
              Share Store Url
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" />
              Share Dispatch Url
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="small-label">Upload Call Center Audio</div>
              <input type="file" className="input" />
            </div>
            <div>
              <div className="small-label">Dispatching - Ring Timeout</div>
              <input className="input" placeholder="0" />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>GPS Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div className="small-label">GPS Enabled</div>
            <select className="select" defaultValue="Yes">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div>
            <div className="small-label">Location Update Interval (seconds)</div>
            <input className="input" placeholder="30" />
          </div>
          <div>
            <div className="small-label">Accuracy Level</div>
            <select className="select" defaultValue="High">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <div className="small-label">Geofence Radius (meters)</div>
            <input className="input" placeholder="100" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add Devices</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <div className="small-label">Device ID</div>
            <input className="input" placeholder="Device ID" />
          </div>
          <div>
            <div className="small-label">Device Name</div>
            <input className="input" placeholder="Device Name" />
          </div>
          <div>
            <div className="small-label">Platform</div>
            <select className="select" defaultValue="Android">
              <option>Android</option>
              <option>iOS</option>
              <option>Web</option>
            </select>
          </div>
          <div>
            <div className="small-label">Assign User</div>
            <input className="input" placeholder="user@company.com" />
          </div>
        </div>
        <button className="btn">Add Device</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn">Save Requirements</button>
      </div>
    </div>
  )
}
