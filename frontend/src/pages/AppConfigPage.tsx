import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 26 }}>
    <h4 style={{ margin: '12px 0', fontWeight: 700 }}>{title}</h4>
    <div className="card">{children}</div>
  </div>
)

const ToggleItem = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span style={{ fontSize: 14 }}>{label}</span>
  </label>
)

export default function AppConfigPage() {
  const [featurePermissions, setFeaturePermissions] = useState({
    chat: false,
    broadcast: false,
    beam2talk: false,
    gps: false,
    callSms: false,
    event: false,
    notify: false,
    video: false,
    media: false,
    rsvp: false,
    snap: false,
    location: false,
  })

  const [appsPermissions, setAppsPermissions] = useState({
    onMove: false,
    beamAssist: false,
  })

  const [webPermissions, setWebPermissions] = useState({
    broadcast: false,
    callCentre: false,
    friend: false,
    webBooker: false,
    first: false,
    calendar: false,
    video: false,
    fixedEstimatedFare: false,
    eventCreator: false,
    ride: false,
    admin: false,
    projectEventCreator: false,
    dashboard: false,
  })

  const [deviceSettings, setDeviceSettings] = useState({
    deviceIndependentLogin: false,
    minAndroidVersion: '',
    minAndroidForcedVersion: '',
  })

  const handleToggle = <T extends Record<string, boolean>>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    group: T,
    key: keyof T,
  ) => {
    setter({ ...group, [key]: !group[key] })
  }

  return (
    <div className="card">
      <PageHeader title="App Config" />

      <Section title="Feature Permissions:">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          <div>
            <ToggleItem label="Chat" checked={featurePermissions.chat} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'chat')} />
            <ToggleItem label="BroadCast" checked={featurePermissions.broadcast} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'broadcast')} />
            <ToggleItem label="beam2talk" checked={featurePermissions.beam2talk} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'beam2talk')} />
          </div>
          <div>
            <ToggleItem label="GPS" checked={featurePermissions.gps} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'gps')} />
            <ToggleItem label="Call/Sms" checked={featurePermissions.callSms} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'callSms')} />
            <ToggleItem label="Event" checked={featurePermissions.event} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'event')} />
          </div>
          <div>
            <ToggleItem label="Notify" checked={featurePermissions.notify} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'notify')} />
            <ToggleItem label="Video" checked={featurePermissions.video} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'video')} />
            <ToggleItem label="Media" checked={featurePermissions.media} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'media')} />
          </div>
          <div>
            <ToggleItem label="RSVP" checked={featurePermissions.rsvp} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'rsvp')} />
            <ToggleItem label="Snap" checked={featurePermissions.snap} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'snap')} />
            <ToggleItem label="Location" checked={featurePermissions.location} onChange={() => handleToggle(setFeaturePermissions, featurePermissions, 'location')} />
          </div>
        </div>
      </Section>

      <Section title="Apps Permissions:">
        <div style={{ display: 'flex', gap: 100 }}>
          <ToggleItem label="onMove" checked={appsPermissions.onMove} onChange={() => handleToggle(setAppsPermissions, appsPermissions, 'onMove')} />
          <ToggleItem label="beamAssist" checked={appsPermissions.beamAssist} onChange={() => handleToggle(setAppsPermissions, appsPermissions, 'beamAssist')} />
        </div>
      </Section>

      <Section title="Web Permissions:">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          <div>
            <ToggleItem label="Broadcast" checked={webPermissions.broadcast} onChange={() => handleToggle(setWebPermissions, webPermissions, 'broadcast')} />
            <ToggleItem label="Call Centre" checked={webPermissions.callCentre} onChange={() => handleToggle(setWebPermissions, webPermissions, 'callCentre')} />
            <ToggleItem label="Friend" checked={webPermissions.friend} onChange={() => handleToggle(setWebPermissions, webPermissions, 'friend')} />
            <ToggleItem label="Web booker meter payment" checked={webPermissions.webBooker} onChange={() => handleToggle(setWebPermissions, webPermissions, 'webBooker')} />
          </div>

          <div>
            <ToggleItem label="First" checked={webPermissions.first} onChange={() => handleToggle(setWebPermissions, webPermissions, 'first')} />
            <ToggleItem label="Calendar" checked={webPermissions.calendar} onChange={() => handleToggle(setWebPermissions, webPermissions, 'calendar')} />
            <ToggleItem label="Video" checked={webPermissions.video} onChange={() => handleToggle(setWebPermissions, webPermissions, 'video')} />
            <ToggleItem label="Fixed Estimated Fare" checked={webPermissions.fixedEstimatedFare} onChange={() => handleToggle(setWebPermissions, webPermissions, 'fixedEstimatedFare')} />
          </div>

          <div>
            <ToggleItem label="Event Creator" checked={webPermissions.eventCreator} onChange={() => handleToggle(setWebPermissions, webPermissions, 'eventCreator')} />
            <ToggleItem label="Ride" checked={webPermissions.ride} onChange={() => handleToggle(setWebPermissions, webPermissions, 'ride')} />
            <ToggleItem label="Admin" checked={webPermissions.admin} onChange={() => handleToggle(setWebPermissions, webPermissions, 'admin')} />
          </div>

          <div>
            <ToggleItem label="Project Event Creator" checked={webPermissions.projectEventCreator} onChange={() => handleToggle(setWebPermissions, webPermissions, 'projectEventCreator')} />
            <ToggleItem label="Dashboard" checked={webPermissions.dashboard} onChange={() => handleToggle(setWebPermissions, webPermissions, 'dashboard')} />
          </div>
        </div>
      </Section>

      <Section title="Device Settings:">
        <ToggleItem
          label="Device Independent Login"
          checked={deviceSettings.deviceIndependentLogin}
          onChange={() =>
            setDeviceSettings((p) => ({ ...p, deviceIndependentLogin: !p.deviceIndependentLogin }))
          }
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 12 }}>
          <input
            className="input"
            placeholder="Min Android version"
            value={deviceSettings.minAndroidVersion}
            onChange={(e) => setDeviceSettings((p) => ({ ...p, minAndroidVersion: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Min Android Forced version"
            value={deviceSettings.minAndroidForcedVersion}
            onChange={(e) =>
              setDeviceSettings((p) => ({ ...p, minAndroidForcedVersion: e.target.value }))
            }
          />
        </div>
      </Section>

      <Section title="Meter Settings:">
        <div style={{ color: '#777', fontSize: 13 }}>(Add Meter settings fields here...)</div>
      </Section>
    </div>
  )
}