import { Suspense } from 'react'
import DashboardView from './_components/DashboardView'
import { getTimeEntriesForPayPeriod } from '@/lib/notion/queries'
import { getTasksForPeriod } from '@/lib/notion/queries'
import { getProjectsForPeriod } from '@/lib/notion/queries'
import { getActiveTimeEntries } from '@/lib/notion/queries'
import { getRangeForPreset } from './_lib/helpers'

export default async function DashboardPage() {
  const defaultRange = getRangeForPreset('week')

  const [timeEntries, tasks, projects, activeWorkers] = await Promise.allSettled([
    getTimeEntriesForPayPeriod(defaultRange.start, defaultRange.end),
    getTasksForPeriod(defaultRange.start, defaultRange.end),
    getProjectsForPeriod(defaultRange.start, defaultRange.end),
    getActiveTimeEntries(),
  ]).then((results) => results.map((r) => (r.status === 'fulfilled' ? r.value : [])))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
      <DashboardView
        initialRange={defaultRange}
        initialTimeEntries={timeEntries as Awaited<ReturnType<typeof getTimeEntriesForPayPeriod>>}
        initialTasks={tasks as Awaited<ReturnType<typeof getTasksForPeriod>>}
        initialProjects={projects as Awaited<ReturnType<typeof getProjectsForPeriod>>}
        initialActiveWorkers={activeWorkers as Awaited<ReturnType<typeof getActiveTimeEntries>>}
      />
    </div>
  )
}
