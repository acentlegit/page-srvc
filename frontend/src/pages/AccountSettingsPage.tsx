import React from 'react'
import PageHeader from '../components/PageHeader'

export default function AccountSettingsPage() {
  return (
    <div className="card">
      <PageHeader title="Account Settings" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div className="small-label">First Name</div>
          <input className="input" placeholder="First name" />
        </div>
        <div>
          <div className="small-label">Last Name</div>
          <input className="input" placeholder="Last name" />
        </div>
        <div>
          <div className="small-label">Email Address</div>
          <input className="input" placeholder="name@company.com" />
        </div>
        <div>
          <div className="small-label">Phone Number</div>
          <input className="input" placeholder="+1 555 000 0000" />
        </div>
        <div>
          <div className="small-label">Custom ID</div>
          <input className="input" placeholder="BEAM0000" />
        </div>
        <div>
          <div className="small-label">Beam ID</div>
          <input className="input" placeholder="beam.id" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="small-label">Address</div>
          <input className="input" placeholder="Street address" />
        </div>
        <div>
          <div className="small-label">City</div>
          <input className="input" placeholder="City" />
        </div>
        <div>
          <div className="small-label">State</div>
          <input className="input" placeholder="State" />
        </div>
        <div>
          <div className="small-label">Country</div>
          <input className="input" placeholder="Country" />
        </div>
        <div>
          <div className="small-label">Zip Code</div>
          <input className="input" placeholder="Zip Code" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="small-label">Upload Logo</div>
          <input type="file" className="input" />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn">Submit</button>
      </div>
    </div>
  )
}
