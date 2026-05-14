'use client'

import { useState, useCallback } from 'react'
import WeekSelect, { type DateRange } from './WeekSelect'
import PersonSection from './PersonSection'
import OverviewCards from './OverviewCards'
import TimeEntriesSection from './TimeEntriesSection'
import TasksSection from './TasksSection'
import ProjectsSection from './ProjectSection'
import { getPersonNames } from '../_lib/helpers'
import type { TimeEntry } from '@/types/time-entry'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'
import type { DateRange as DR } from '../_lib/constants'

type Tab = 'people' | 'time' | 'tasks' | 'projects'

interface DashboardViewProps {
  initialRange: DR
  initialTimeEntries: TimeEntry[]
  initialTasks: Task[]
  initialProjects: Project[]
  initialActiveWorkers: TimeEntry[]
}

export default function DashboardView({
  initialRange,
  initialTimeEntries,
  initialTasks,
  initialProjects,
  initialActiveWorkers,
}: DashboardViewProps) {
  const [range, setRange] = useState<DateRange>(initialRange)
  const [activeTab, setActiveTab] = useState<Tab>('people')
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeWorkers] = useState<TimeEntry[]>(initialActiveWorkers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true)
    setError(null)
    const params = `start=${encodeURIComponent(r.start)}&end=${encodeURIComponent(r.end)}`
    try {
      const [teRes, tasksRes, projectsRes] = await Promise.all([
        fetch(`/api/notion/time-entries?${params}`),
        fetch(`/api/notion/tasks?${params}`),
        fetch(`/api/notion/projects?${params}`),
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

  const personNames = getPersonNames(timeEntries, tasks, projects)

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'people', label: 'By Person', count: personNames.length },
    { id: 'time', label: 'Time Entries', count: timeEntries.length },
    { id: 'tasks', label: 'Tasks', count: tasks.length },
    { id: 'projects', label: 'Projects', count: projects.length },
  ]

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <WeekSelect onChange={handleRangeChange} initial="week" />

      {/* Overview cards */}
      <OverviewCards
        range={range}
        timeEntries={timeEntries}
        tasks={tasks}
        activeWorkers={activeWorkers}
        loading={loading}
      />

      {/* Tabs + content */}
      <div>
        <div className="flex items-center gap-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {!loading && (
                <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'people' && (
                personNames.length === 0 ? (
                  <p className="text-sm text-gray-400">No activity found for this period.</p>
                ) : (
                  <div className="space-y-4">
                    {personNames.map((name) => (
                      <PersonSection
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
                )
              )}
              {activeTab === 'time' && <TimeEntriesSection entries={timeEntries} />}
              {activeTab === 'tasks' && <TasksSection tasks={tasks} />}
              {activeTab === 'projects' && <ProjectsSection projects={projects} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
