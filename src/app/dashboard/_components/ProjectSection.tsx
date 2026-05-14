import { fmtDate } from '../_lib/helpers'
import { PROJECT_STATUS_COLORS } from '../_lib/constants'
import type { Project } from '@/types/project'

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="text-sm text-gray-500">No projects with deadlines in this period.</p>
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-gray-500">{projects.length} projects</span>
      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-gray-800 font-medium truncate">{project.name}</span>
              {project.status && (
                <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {project.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4 text-gray-500">
              {project.ownerNames.length > 0 && <span className="text-xs">{project.ownerNames.join(', ')}</span>}
              {project.deadline && <span className="text-xs">Due {fmtDate(project.deadline)}</span>}
              <a href={project.notionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700">↗</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
