import TodayView from '../_components/TodayView'
import { getTimeEntriesForPayPeriod } from '@/lib/notion/queries'
import { getTasksForDay } from '@/lib/notion/queries'
import { getProjectsForDay } from '@/lib/notion/queries'
import { getActiveTimeEntries } from '@/lib/notion/queries'
import { getRangeForPreset } from '../_lib/helpers'

export default async function TodayPage() {
  const defaultRange = getRangeForPreset('day')

  const [timeEntries, tasks, projects, activeWorkers] = await Promise.allSettled([
    getTimeEntriesForPayPeriod(defaultRange.start, defaultRange.end),
    getTasksForDay(defaultRange.start),
    getProjectsForDay(defaultRange.start),
    getActiveTimeEntries(),
  ]).then((results) => results.map((r) => (r.status === 'fulfilled' ? r.value : [])))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Today</h1>
      <TodayView
        initialRange={defaultRange}
        initialTimeEntries={timeEntries as Awaited<ReturnType<typeof getTimeEntriesForPayPeriod>>}
        initialTasks={tasks as Awaited<ReturnType<typeof getTasksForDay>>}
        initialProjects={projects as Awaited<ReturnType<typeof getProjectsForDay>>}
        initialActiveWorkers={activeWorkers as Awaited<ReturnType<typeof getActiveTimeEntries>>}
      />
    </div>
  )
}
