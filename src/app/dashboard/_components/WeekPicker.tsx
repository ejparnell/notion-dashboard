'use client'

import { useState } from 'react'
import type { DateRange } from '../_lib/constants'

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}

function makeWeekRange(monday: Date): DateRange {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)
  const todayMonday = getMondayOfWeek(new Date())
  const isCurrentWeek = toISO(monday) === toISO(todayMonday)
  const label = isCurrentWeek
    ? 'This week'
    : `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(sunday.getTime() - 86_400_000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  return { start: toISO(monday), end: toISO(sunday), label }
}

interface WeekPickerProps {
  onChange: (range: DateRange) => void
  initialMonday?: string
}

export default function WeekPicker({ onChange, initialMonday }: WeekPickerProps) {
  const todayMonday = getMondayOfWeek(new Date())
  const [monday, setMonday] = useState<Date>(() =>
    initialMonday ? new Date(initialMonday + 'T00:00:00') : todayMonday
  )

  const isCurrentWeek = toISO(monday) === toISO(todayMonday)

  function applyMonday(d: Date) {
    setMonday(d)
    onChange(makeWeekRange(d))
  }

  function stepWeek(delta: number) {
    const next = new Date(monday)
    next.setDate(monday.getDate() + delta * 7)
    applyMonday(next)
  }

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const displayLabel = isCurrentWeek
    ? `This week (${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    : `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => stepWeek(-1)}
        className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        aria-label="Previous week"
      >
        ←
      </button>

      <div className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 min-w-[220px] text-center select-none">
        {displayLabel}
      </div>

      <button
        onClick={() => stepWeek(1)}
        disabled={isCurrentWeek}
        className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
        aria-label="Next week"
      >
        →
      </button>

      {!isCurrentWeek && (
        <button
          onClick={() => applyMonday(todayMonday)}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          This Week
        </button>
      )}
    </div>
  )
}
