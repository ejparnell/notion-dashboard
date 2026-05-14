'use client'

import type { TimeEntry } from '@/types/time-entry'
import type { Task } from '@/types/task'
import type { DateRange } from '../_lib/constants'
import { fmtDuration } from '../_lib/helpers'

interface OverviewCardsProps {
  range: DateRange | null
  timeEntries: TimeEntry[]
  tasks: Task[]
  activeWorkers: TimeEntry[]
  loading: boolean
  clockedInLabel?: string
  clockedInSub?: string
}

interface CardProps {
  label: string
  value: string | number
  sub?: string
  loading: boolean
}

function StatCard({ label, value, sub, loading }: CardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex flex-col gap-1 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-7 w-16 rounded bg-gray-100 animate-pulse mt-1" />
      ) : (
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      )}
      {sub && !loading && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function OverviewCards({ range, timeEntries, tasks, activeWorkers, loading, clockedInLabel, clockedInSub }: OverviewCardsProps) {
  // Total minutes across all time entries in period
  const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0)

  // Unique workers with time entries in period
  const workerSet = new Set<string>()
  timeEntries.forEach((e) =>
    (e.personNames.length ? e.personNames : ['Unassigned']).forEach((n) => workerSet.add(n))
  )
  const workerCount = workerSet.size

  // Currently clocked in (active entries today)
  const activeSet = new Set<string>()
  activeWorkers.forEach((e) =>
    (e.personNames.length ? e.personNames : ['Unassigned']).forEach((n) => activeSet.add(n))
  )
  const activeCount = activeSet.size

  // Tasks with status "Done" in period
  const doneTasks = tasks.filter((t) => t.status === 'Done').length

  const periodLabel = range ? range.label : '—'

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Total Hours"
        value={loading || !range ? '—' : fmtDuration(totalMinutes)}
        sub={range ? periodLabel : undefined}
        loading={loading && !!range}
      />
      <StatCard
        label="Workers Active"
        value={loading || !range ? '—' : workerCount}
        sub={range ? `in ${periodLabel.toLowerCase()}` : undefined}
        loading={loading && !!range}
      />
      <StatCard
        label={clockedInLabel ?? 'Clocked In Now'}
        value={activeCount}
        sub={clockedInSub ?? 'currently active today'}
        loading={false}
      />
      <StatCard
        label="Tasks Done"
        value={loading || !range ? '—' : doneTasks}
        sub={range ? periodLabel : undefined}
        loading={loading && !!range}
      />
    </div>
  )
}
