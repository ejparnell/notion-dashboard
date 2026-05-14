'use client'

import { useState } from 'react'
import type { DateRange } from '../_lib/constants'

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function makeDayRange(iso: string): DateRange {
  const d = new Date(iso + 'T00:00:00')
  const next = new Date(d)
  next.setDate(d.getDate() + 1)
  const todayISO = toISO(new Date())
  const label =
    iso === todayISO
      ? 'Today'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return { start: iso, end: toISO(next), label }
}

interface DaySelectProps {
  onChange: (range: DateRange) => void
  initialDate?: string
}

export default function DaySelect({ onChange, initialDate }: DaySelectProps) {
  const todayISO = toISO(new Date())
  const [selectedDate, setSelectedDate] = useState(initialDate ?? todayISO)

  function applyDate(iso: string) {
    setSelectedDate(iso)
    onChange(makeDayRange(iso))
  }

  function stepDay(delta: number) {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    applyDate(toISO(d))
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => stepDay(-1)}
        className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        aria-label="Previous day"
      >
        ←
      </button>

      <input
        type="date"
        value={selectedDate}
        max={todayISO}
        onChange={(e) => e.target.value && applyDate(e.target.value)}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
      />

      <button
        onClick={() => stepDay(1)}
        disabled={selectedDate >= todayISO}
        className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
        aria-label="Next day"
      >
        →
      </button>

      {selectedDate !== todayISO && (
        <button
          onClick={() => applyDate(todayISO)}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          Today
        </button>
      )}
    </div>
  )
}
