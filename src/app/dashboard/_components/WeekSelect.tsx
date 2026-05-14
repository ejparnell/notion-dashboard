'use client'

import { useState } from 'react'
import { PRESETS, type DateRange, type Preset } from '../_lib/constants'
import { toISO, getRangeForPreset, getInitialRange } from '../_lib/helpers'

export type { DateRange, Preset }
export { getInitialRange }

interface WeekSelectProps {
  onChange: (range: DateRange) => void
  initial?: Preset
}

export default function WeekSelect({ onChange, initial = 'week' }: WeekSelectProps) {
  const [preset, setPreset] = useState<Preset>(initial)
  const [customStart, setCustomStart] = useState(() => toISO(new Date()))
  const [customEnd, setCustomEnd] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return toISO(d)
  })

  function applyPreset(p: Preset) {
    setPreset(p)
    if (p !== 'custom') {
      onChange(getRangeForPreset(p))
    }
  }

  function applyCustom() {
    if (!customStart || !customEnd || customEnd <= customStart) return
    onChange({
      start: customStart,
      end: customEnd,
      label: `${customStart} – ${customEnd}`,
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Preset pills */}
      <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
        {PRESETS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => applyPreset(value)}
            className={`
              rounded-md px-3 py-1.5 text-sm font-medium transition-colors
              ${preset === value
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {preset === 'custom' && (
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">From</label>
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">To</label>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
            />
          </div>
          <button
            onClick={applyCustom}
            disabled={!customStart || !customEnd || customEnd <= customStart}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
