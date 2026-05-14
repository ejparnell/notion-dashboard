import { STATUS_ORDER, STATUS_COLORS } from '../_lib/constants'
import type { Task } from '@/types/task'

export default function TasksSection({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-500">No tasks updated in this period.</p>
  }

  const byStatus = STATUS_ORDER.reduce<Record<string, Task[]>>((acc, s) => {
    acc[s!] = tasks.filter((t) => t.status === s)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <span className="text-sm font-medium text-gray-500">{tasks.length} tasks</span>
      {STATUS_ORDER.filter((s) => byStatus[s!]?.length > 0).map((status) => (
        <div key={status!}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status!] ?? 'bg-gray-100 text-gray-600'}`}>
              {status}
            </span>
            <span className="text-gray-400 font-normal text-xs">{byStatus[status!].length}</span>
          </h3>
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
            {byStatus[status!].map((task) => (
              <div key={task.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  {task.billable && <span className="shrink-0 text-xs text-emerald-600 font-semibold">$</span>}
                  <span className="text-gray-800 truncate">{task.name || 'Untitled'}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4 text-gray-500">
                  {task.priority && <span className="text-xs">{task.priority}</span>}
                  {task.timeEstimate && (
                    <span className="text-xs bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">{task.timeEstimate}</span>
                  )}
                  <a href={task.notionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700">↗</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
