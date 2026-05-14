import TimeEntriesView from './_components/TimeEntriesView'
import { getAllWorkerNames, getTimeEntriesForPayPeriod, getTasksForPeriod, getProjectsForPeriod } from '@/lib/notion/queries'

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function thisWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)
  return { start: toISO(monday), end: toISO(sunday) }
}

export default async function TimeEntriesPage() {
  const range = thisWeekRange()

  const [workers, entries, tasks, projects] = await Promise.allSettled([
    getAllWorkerNames(),
    getTimeEntriesForPayPeriod(range.start, range.end),
    getTasksForPeriod(range.start, range.end),
    getProjectsForPeriod(range.start, range.end),
  ]).then((results) => results.map((r) => (r.status === 'fulfilled' ? r.value : [])))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Time Entries</h1>
      <TimeEntriesView
        initialWorkers={workers as string[]}
        initialEntries={entries as Awaited<ReturnType<typeof getTimeEntriesForPayPeriod>>}
        initialTasks={tasks as Awaited<ReturnType<typeof getTasksForPeriod>>}
        initialProjects={projects as Awaited<ReturnType<typeof getProjectsForPeriod>>}
        initialRange={range}
      />
    </div>
  )
}
