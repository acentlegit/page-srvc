import React from 'react'
import PageHeader from '../components/PageHeader'

export default function GeneralSettingsPage() {
  return (
    <div className="card">
      <PageHeader title="General Settings" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div className="small-label">Preferred Language</div>
          <select className="select" defaultValue="English">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div>
          <div className="small-label">Preferred Timezone</div>
          <select className="select" defaultValue="UTC">
            <option>UTC</option>
            <option>PST</option>
            <option>EST</option>
            <option>IST</option>
          </select>
        </div>
        <div>
          <div className="small-label">Select Currency</div>
          <select className="select" defaultValue="USD">
            <option>USD</option>
            <option>EUR</option>
            <option>INR</option>
          </select>
        </div>
        <div>
          <div className="small-label">Select Value</div>
          <input className="input" placeholder="Value" />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn">Submit</button>
      </div>
    </div>
  )
}
