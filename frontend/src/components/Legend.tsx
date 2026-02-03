import React from 'react'

export type LegendItem = { label: string; color: string }

export default function Legend({
  items,
  selectedLabels,
  onToggle,
}: {
  items: LegendItem[]
  selectedLabels?: Set<string>
  onToggle?: (label: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((x) => (
        <label key={x.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={selectedLabels ? selectedLabels.has(x.label) : false}
            onChange={() => onToggle?.(x.label)}
          />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: x.color, display: 'inline-block' }} />
          <span style={{ fontSize: 13 }}>{x.label}</span>
        </label>
      ))}
    </div>
  )
}