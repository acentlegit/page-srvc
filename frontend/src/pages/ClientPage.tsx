import React from 'react'
import PageHeader from '../components/PageHeader'

export default function ClientPage() {
  return (
    <div className="card">
      <PageHeader title="Client" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Payment</h3>
          <div className="small-label">Choose Payment Type:</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="paymentType" defaultChecked />
              Fixed
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="paymentType" />
              Recurring
            </label>
          </div>

          <div className="small-label">Name</div>
          <input className="input" placeholder="Name" />

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn">Submit</button>
            <button className="btn btn-secondary">Cancel</button>
          </div>
        </div>

        <div>
          <div className="small-label">Amount ($)</div>
          <input className="input" placeholder="0" />
        </div>
      </div>
    </div>
  )
}
