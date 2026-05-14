'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TimeEntry } from '@/types/time-entry'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'
import WorkerSelect from './WorkerSelect'
import BillingPeriodSelect, { type BillingPreset } from './BillingPeriodSelect'
import PayRateInput from './PayRateInput'
import BillingSummary from './BillingSummary'
import TodayPersonSection from '@/app/dashboard/_components/TodayPersonSection'

type DateRange = { start: string; end: string }

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getRangeForPreset(preset: BillingPreset): DateRange {
  const now = new Date()
  if (preset === 'day') {
    const start = toISO(now)
    const end = toISO(new Date(now.getTime() + 86_400_000))
    return { start, end }
  }
  if (preset === 'week') {
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((day + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 7)
    return { start: toISO(monday), end: toISO(sunday) }
  }
  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return { start: toISO(start), end: toISO(end) }
  }
  // custom — caller manages start/end separately
  const start = toISO(new Date(now.getFullYear(), now.getMonth(), 1))
  const end = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 1))
  return { start, end }
}

type Props = {
  initialWorkers: string[]
  initialEntries: TimeEntry[]
  initialTasks: Task[]
  initialProjects: Project[]
  initialRange: DateRange
}

export default function TimeEntriesView({
  initialWorkers,
  initialEntries,
  initialTasks,
  initialProjects,
  initialRange,
}: Props) {
  const [workers, setWorkers] = useState<string[]>(initialWorkers)
  const [selectedWorker, setSelectedWorker] = useState<string>(initialWorkers[0] ?? '')
  const [preset, setPreset] = useState<BillingPreset>('week')
  const [range, setRange] = useState<DateRange>(initialRange)
  const [customStart, setCustomStart] = useState(initialRange.start)
  const [customEnd, setCustomEnd] = useState(initialRange.end)
  const [payRate, setPayRate] = useState(25)
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async (start: string, end: string) => {
    setLoading(true)
    try {
      const [entriesRes, tasksRes, projectsRes] = await Promise.all([
        fetch(`/api/notion/time-entries?start=${start}&end=${end}`),
        fetch(`/api/notion/tasks?start=${start}&end=${end}`),
        fetch(`/api/notion/projects?start=${start}&end=${end}`),
      ])
      if (entriesRes.ok) setEntries(await entriesRes.json())
      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (projectsRes.ok) setProjects(await projectsRes.json())
    } finally {
      setLoading(false)
    }
  }, [])

  // When preset changes (not custom), compute and fetch new range
  useEffect(() => {
    if (preset === 'custom') return
    const r = getRangeForPreset(preset)
    setRange(r)
    setCustomStart(r.start)
    setCustomEnd(r.end)
    fetchAll(r.start, r.end)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  function handleCustomApply() {
    setRange({ start: customStart, end: customEnd })
    fetchAll(customStart, customEnd)
  }

  // Fetch worker list if not provided (SSR fallback)
  useEffect(() => {
    if (workers.length === 0) {
      fetch('/api/notion/workers')
        .then((r) => r.json())
        .then((data: string[]) => {
          setWorkers(data)
          if (data.length > 0) setSelectedWorker(data[0])
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const workerEntries = entries.filter((e) => e.personNames.includes(selectedWorker))
  const workerTasks = tasks.filter((t) => t.ownerNames.includes(selectedWorker))
  const workerProjects = projects.filter((p) => p.ownerNames.includes(selectedWorker))

  return (
    <div className="space-y-6">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {workers.length > 0 && (
          <WorkerSelect
            workers={workers}
            value={selectedWorker}
            onChange={setSelectedWorker}
          />
        )}

        <BillingPeriodSelect value={preset} onChange={setPreset} />

        <PayRateInput
          workerName={selectedWorker}
          value={payRate}
          onChange={setPayRate}
        />
      </div>

      {/* Custom date range picker */}
      {preset === 'custom' && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleCustomApply}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : selectedWorker ? (
        <div className="space-y-6">
          <BillingSummary
            entries={workerEntries}
            workerName={selectedWorker}
            payRate={payRate}
            start={range.start}
            end={range.end}
          />
          <TodayPersonSection
            name={selectedWorker}
            timeEntries={workerEntries}
            tasks={workerTasks}
            projects={workerProjects}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No workers found.
        </div>
      )}
    </div>
  )
}
