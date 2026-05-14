'use client'

import { useState } from 'react'
import { fmtDuration, fmtDate } from '../_lib/helpers'
import { STATUS_COLORS, PROJECT_STATUS_COLORS } from '../_lib/constants'
import type { TimeEntry } from '@/types/time-entry'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'

type Tab = 'time' | 'tasks' | 'projects'

type Props = {
  name: string
  timeEntries: TimeEntry[]
  tasks: Task[]
  projects: Project[]
}

const STATUS_SORT: Record<string, number> = {
  'In Progress': 0,
  'Todo': 1,
  'Inbox': 2,
  'Done': 3,
}

export default function TodayPersonSection({ name, timeEntries, tasks, projects }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('time')

  const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0)
  const billableCount = tasks.filter((t) => t.billable).length
  const sortedTasks = [...tasks].sort(
    (a, b) => (STATUS_SORT[a.status ?? ''] ?? 99) - (STATUS_SORT[b.status ?? ''] ?? 99)
  )

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'time', label: 'Time Entries', count: timeEntries.length },
    { id: 'tasks', label: 'Tasks', count: tasks.length },
    { id: 'projects', label: 'Projects', count: projects.length },
  ]

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Person header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{name}</h2>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {timeEntries.length > 0 && (
            <span>
              <span className="font-medium text-gray-700">{fmtDuration(totalMinutes)}</span>
              {' · '}{timeEntries.length} {timeEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
          {tasks.length > 0 && (
            <span>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              {billableCount > 0 && (
                <span className="text-emerald-600 font-medium"> · {billableCount} billable</span>
              )}
            </span>
          )}
          {projects.length > 0 && (
            <span>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
          )}
        </div>
      </div>

      {/* Per-person tab bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-4">

        {/* ── Time Entries ── */}
        {activeTab === 'time' && (
          timeEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No time entries for this day.</p>
          ) : (
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <span className="text-gray-800 font-medium">{entry.title || 'Untitled'}</span>
                    {entry.isActive && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <span className="text-xs">{fmtDate(entry.startTime)}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {fmtDuration(entry.durationMinutes)}
                    </span>
                    <a
                      href={entry.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-700"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Tasks (In Progress sorted to top) ── */}
        {activeTab === 'tasks' && (
          sortedTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No tasks for this day.</p>
          ) : (
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {sortedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {task.billable && (
                      <span className="shrink-0 text-xs text-emerald-600 font-semibold">$</span>
                    )}
                    {task.status && (
                      <span
                        className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[task.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {task.status}
                      </span>
                    )}
                    <span className="text-gray-800 truncate">{task.name || 'Untitled'}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4 text-gray-500">
                    {task.priority && <span className="text-xs">{task.priority}</span>}
                    {task.timeEstimate && (
                      <span className="text-xs bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                        {task.timeEstimate}
                      </span>
                    )}
                    <a
                      href={task.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-700"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Projects ── */}
        {activeTab === 'projects' && (
          projects.length === 0 ? (
            <p className="text-sm text-gray-400">No active projects for this day.</p>
          ) : (
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-gray-800 font-medium truncate">{project.name}</span>
                    {project.status && (
                      <span
                        className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          PROJECT_STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {project.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4 text-gray-500">
                    {project.deadline && (
                      <span className="text-xs">Due {fmtDate(project.deadline)}</span>
                    )}
                    <a
                      href={project.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-700"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  )
}
