import { fmtDuration, fmtDate } from '../_lib/helpers'
import type { TimeEntry } from '@/types/time-entry'

export default function TimeEntriesSection({ entries }: { entries: TimeEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">No time entries in this period.</p>
  }

  const byPerson = entries.reduce<Record<string, { name: string; entries: TimeEntry[]; totalMinutes: number }>>(
    (acc, entry) => {
      const names = entry.personNames.length > 0 ? entry.personNames : ['Unassigned']
      names.forEach((name) => {
        if (!acc[name]) acc[name] = { name, entries: [], totalMinutes: 0 }
        acc[name].entries.push(entry)
        acc[name].totalMinutes += entry.durationMinutes ?? 0
      })
      return acc
    },
    {}
  )

  const totalMinutes = entries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{entries.length} entries</span>
        <span className="text-sm font-semibold text-gray-800">Total: {fmtDuration(totalMinutes)}</span>
      </div>

      {Object.values(byPerson).map(({ name, entries: pEntries, totalMinutes: pTotal }) => (
        <div key={name}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">{name}</h3>
            <span className="text-xs text-gray-500">{fmtDuration(pTotal)}</span>
          </div>
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
            {pEntries.map((entry) => (
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
                  <span>{fmtDate(entry.startTime)}</span>
                  <span className="font-medium text-gray-700">{fmtDuration(entry.durationMinutes)}</span>
                  <a href={entry.notionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700">↗</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
