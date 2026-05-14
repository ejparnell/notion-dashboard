'use client'

import type { TimeEntry } from '@/types/time-entry'

type Props = {
  entries: TimeEntry[]
  workerName: string
  payRate: number
  start: string
  end: string
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function fmtHours(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

type DayGroup = {
  date: string // YYYY-MM-DD
  label: string
  entries: TimeEntry[]
  totalMinutes: number
}

function groupByDay(entries: TimeEntry[]): DayGroup[] {
  const map = new Map<string, DayGroup>()
  for (const e of entries) {
    if (!e.startTime) continue
    const date = e.startTime.slice(0, 10)
    if (!map.has(date)) {
      map.set(date, { date, label: fmtDate(e.startTime), entries: [], totalMinutes: 0 })
    }
    const group = map.get(date)!
    group.entries.push(e)
    if (!e.isActive && e.durationMinutes !== null) {
      group.totalMinutes += e.durationMinutes
    }
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export default function BillingSummary({ entries, workerName, payRate, start, end }: Props) {
  const workerEntries = entries.filter((e) => e.personNames.includes(workerName))

  if (workerEntries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No time entries found for {workerName} in this period.
      </div>
    )
  }

  const openEntries = workerEntries.filter((e) => e.isActive)
  const closedEntries = workerEntries.filter((e) => !e.isActive)
  const days = groupByDay(closedEntries)
  const totalMinutes = closedEntries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0)
  const totalHours = totalMinutes / 60
  const totalPay = totalHours * payRate

  function buildCopySummary() {
    const lines: string[] = [
      `${workerName} — Pay Period: ${fmtDate(start)} – ${fmtDate(end)}`,
      `Pay rate: $${payRate}/hr`,
      '',
    ]
    for (const day of days) {
      lines.push(`${day.label}  (${fmtHours(day.totalMinutes)})`)
      for (const e of day.entries) {
        if (e.isActive) continue
        const start = e.startTime ? fmtTime(e.startTime) : '?'
        const end = e.endTime ? fmtTime(e.endTime) : '?'
        const dur = e.durationMinutes !== null ? fmtHours(e.durationMinutes) : '?'
        lines.push(`  ${start} – ${end}  (${dur})  ${e.title}`)
      }
    }
    lines.push('')
    lines.push(`Total hours: ${totalHours.toFixed(2)} hrs`)
    lines.push(`Total pay: $${totalPay.toFixed(2)}`)
    return lines.join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildCopySummary())
  }

  return (
    <div className="space-y-4">
      {openEntries.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ {openEntries.length} open (in-progress) entr{openEntries.length === 1 ? 'y' : 'ies'}{' '}
          excluded from totals — close {openEntries.length === 1 ? 'it' : 'them'} in Notion first.
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {days.map((day, di) => (
          <div key={day.date} className={di > 0 ? 'border-t border-gray-100' : ''}>
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
              <span className="text-sm font-semibold text-gray-700">{day.label}</span>
              <span className="text-sm text-gray-500">{fmtHours(day.totalMinutes)}</span>
            </div>
            {day.entries.map((e) => {
              const start = e.startTime ? fmtTime(e.startTime) : '—'
              const end = e.endTime ? fmtTime(e.endTime) : '—'
              const dur = e.durationMinutes !== null ? fmtHours(e.durationMinutes) : '—'
              return (
                <div
                  key={e.id}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                    e.isActive ? 'bg-amber-50 opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {e.isActive && (
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                        open
                      </span>
                    )}
                    <a
                      href={e.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-blue-600 hover:underline"
                    >
                      {e.title || 'Untitled'}
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>
                      {start} – {end}
                    </span>
                    <span className="w-14 text-right">{dur}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Totals + copy */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="space-y-0.5">
          <p className="text-sm text-gray-500">
            Total hours:{' '}
            <span className="font-semibold text-gray-900">{totalHours.toFixed(2)} hrs</span>
          </p>
          <p className="text-sm text-gray-500">
            Total pay:{' '}
            <span className="font-semibold text-gray-900">${totalPay.toFixed(2)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
        >
          Copy summary
        </button>
      </div>
    </div>
  )
}
