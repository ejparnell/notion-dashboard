'use client'

import { useState, useCallback } from 'react'
import DaySelect from './DaySelect'
import OverviewCards from './OverviewCards'
import TodayPersonSection from './TodayPersonSection'
import { getPersonNames } from '../_lib/helpers'
import type { TimeEntry } from '@/types/time-entry'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'
import type { DateRange } from '../_lib/constants'

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

interface TodayViewProps {
  initialRange: DateRange
  initialTimeEntries: TimeEntry[]
  initialTasks: Task[]
  initialProjects: Project[]
  initialActiveWorkers: TimeEntry[]
}

export default function TodayView({
  initialRange,
  initialTimeEntries,
  initialTasks,
  initialProjects,
  initialActiveWorkers,
}: TodayViewProps) {
  const [range, setRange] = useState<DateRange>(initialRange)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeWorkers] = useState<TimeEntry[]>(initialActiveWorkers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isToday = range.start === toISO(new Date())

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true)
    setError(null)
    const timeParams = `start=${encodeURIComponent(r.start)}&end=${encodeURIComponent(r.end)}`
    const dateParam = `date=${encodeURIComponent(r.start)}`
    try {
      const [teRes, tasksRes, projectsRes] = await Promise.all([
        fetch(`/api/notion/time-entries?${timeParams}`),
        fetch(`/api/notion/tasks-for-day?${dateParam}`),
        fetch(`/api/notion/projects-for-day?${dateParam}`),
      ])
      if (!teRes.ok || !tasksRes.ok || !projectsRes.ok) {
        throw new Error('One or more requests failed')
      }
      const [te, tk, pr] = await Promise.all([
        teRes.json() as Promise<TimeEntry[]>,
        tasksRes.json() as Promise<Task[]>,
        projectsRes.json() as Promise<Project[]>,
      ])
      setTimeEntries(te)
      setTasks(tk)
      setProjects(pr)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRangeChange = useCallback(
    (r: DateRange) => {
      setRange(r)
      fetchData(r)
    },
    [fetchData]
  )

  // For today: show live active workers (those without an End Time).
  // For past days: derive clocked-in count from time entries on that day.
  const clockedInWorkers = isToday ? activeWorkers : timeEntries

  const personNames = getPersonNames(timeEntries, tasks, projects)

  return (
    <div className="space-y-6">
      {/* Day picker */}
      <DaySelect onChange={handleRangeChange} initialDate={initialRange.start} />

      {/* Overview cards */}
      <OverviewCards
        range={range}
        timeEntries={timeEntries}
        tasks={tasks}
        activeWorkers={clockedInWorkers}
        loading={loading}
        clockedInLabel={isToday ? 'Clocked In Now' : 'Clocked In'}
        clockedInSub={isToday ? 'currently active' : `on ${range.label}`}
      />

      {/* Per-worker sections */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : personNames.length === 0 ? (
        <p className="text-sm text-gray-400">No activity found for this day.</p>
      ) : (
        <div className="space-y-4">
          {personNames.map((name) => (
            <TodayPersonSection
              key={name}
              name={name}
              timeEntries={timeEntries.filter((e) =>
                (e.personNames.length ? e.personNames : ['Unassigned']).includes(name)
              )}
              tasks={tasks.filter((t) =>
                (t.ownerNames.length ? t.ownerNames : ['Unassigned']).includes(name)
              )}
              projects={projects.filter((p) =>
                (p.ownerNames.length ? p.ownerNames : ['Unassigned']).includes(name)
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
