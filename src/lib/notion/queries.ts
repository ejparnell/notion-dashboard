import { notion } from './client'
import { NOTION_DATABASES } from './constants'
import { mapTimeEntryPage, mapProjectPage, mapActionPage } from './mapper'
import type { TimeEntryNotionPage } from '@/types/time-entry'
import type { ProjectNotionPage } from '@/types/project'
import type { ActionNotionPage } from '@/types/task'
import type {
  QueryDatabaseParameters,
  QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints'

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Fetch all pages of a paginated databases.query call.
 */
async function queryAll<T>(
  databaseId: string,
  params: Omit<QueryDatabaseParameters, 'database_id'>
): Promise<T[]> {
  // The TS language server may resolve a mismatched SDK version's types.
  // Casting through `unknown` keeps runtime behaviour correct (v2 databases.query).
  type QueryFn = (args: QueryDatabaseParameters) => Promise<QueryDatabaseResponse>
  const dbQuery = (notion.databases as unknown as { query: QueryFn }).query.bind(notion.databases)

  const all: T[] = []
  let cursor: string | undefined = undefined

  do {
    const response = await dbQuery({
      database_id: databaseId,
      ...params,
      // Exclude archived and trashed pages at the Notion API level
      archived: false,
      in_trash: false,
      start_cursor: cursor
    })

    all.push(...(response.results as unknown as T[]))

    cursor = response.has_more && response.next_cursor ? response.next_cursor : undefined
  } while (cursor)

  // Belt-and-suspenders: also filter client-side in case the API returns anything slipping through
  return (all as Array<T & { archived?: boolean; in_trash?: boolean }>).filter(
    (p) => !p.archived && !p.in_trash
  ) as T[]
}

// ─── Time Entries ────────────────────────────────────────────────────────────

/** Fetch time entries within a date range (inclusive start, exclusive end). */
export async function getTimeEntriesForPayPeriod(startDate: string, endDate: string) {
  const pages = await queryAll<TimeEntryNotionPage>(NOTION_DATABASES.timeEntries, {
    filter: {
      and: [
        { property: 'Start Time', date: { on_or_after: startDate } },
        { property: 'Start Time', date: { before: endDate } }
      ]
    },
    sorts: [{ property: 'Start Time', direction: 'ascending' }]
  })
  return pages.map(mapTimeEntryPage)
}

/** Fetch all time entries that are currently active (started but not ended). */
export async function getActiveTimeEntries() {
  const pages = await queryAll<TimeEntryNotionPage>(NOTION_DATABASES.timeEntries, {
    filter: {
      and: [
        { property: 'Start Time', date: { is_not_empty: true } },
        { property: 'End Time', date: { is_empty: true } }
      ]
    },
    sorts: [{ property: 'Start Time', direction: 'ascending' }]
  })
  return pages.map(mapTimeEntryPage)
}

// ─── Projects ────────────────────────────────────────────────────────────────

/** Fetch all active projects. */
export async function getProjects(includeInactive = false) {
  const pages = await queryAll<ProjectNotionPage>(NOTION_DATABASES.projects, {
    filter: includeInactive
      ? undefined
      : { property: 'Status', select: { equals: 'Active' } },
    sorts: [{ property: 'Name', direction: 'ascending' }]
  })
  return pages.map(mapProjectPage)
}

/** Fetch a single project by Notion page ID. */
export async function getProjectById(projectId: string) {
  const page = await notion.pages.retrieve({ page_id: projectId })
  return mapProjectPage(page as unknown as ProjectNotionPage)
}

// ─── Tasks (Actions) ─────────────────────────────────────────────────────────

/** Fetch all tasks, optionally filtered by status. */
export async function getTasks(status?: 'In Progress' | 'Todo' | 'Done' | 'Inbox') {
  const pages = await queryAll<ActionNotionPage>(NOTION_DATABASES.tasks, {
    filter: status ? { property: 'Item', select: { equals: status } } : undefined,
    sorts: [
      { property: 'Order', direction: 'ascending' },
      { property: 'Created At', direction: 'descending' }
    ]
  })
  return pages.map(mapActionPage)
}

/** Fetch tasks last-edited within a date range — useful for period views. */
export async function getTasksForPeriod(startDate: string, endDate: string) {
  const pages = await queryAll<ActionNotionPage>(NOTION_DATABASES.tasks, {
    filter: {
      and: [
        { timestamp: 'last_edited_time', last_edited_time: { on_or_after: startDate } },
        { timestamp: 'last_edited_time', last_edited_time: { before: endDate } }
      ]
    } as QueryDatabaseParameters['filter'],
    sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
  })
  return pages.map(mapActionPage)
}

/** Fetch projects whose deadline falls within a date range. */
export async function getProjectsForPeriod(startDate: string, endDate: string) {
  const pages = await queryAll<ProjectNotionPage>(NOTION_DATABASES.projects, {
    filter: {
      and: [
        { property: 'Deadline', date: { on_or_after: startDate } },
        { property: 'Deadline', date: { before: endDate } }
      ]
    } as QueryDatabaseParameters['filter'],
    sorts: [{ property: 'Deadline', direction: 'ascending' }]
  })
  return pages.map(mapProjectPage)
}

/** Returns the ISO date string for the day after the given YYYY-MM-DD date. */
function nextDay(date: string): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Fetch tasks for a single day:
 * - tasks edited on that day (status change / updates), OR
 * - tasks currently In Progress (always visible regardless of edit date)
 */
export async function getTasksForDay(date: string) {
  const end = nextDay(date)
  const pages = await queryAll<ActionNotionPage>(NOTION_DATABASES.tasks, {
    filter: {
      or: [
        {
          and: [
            { timestamp: 'last_edited_time', last_edited_time: { on_or_after: date } },
            { timestamp: 'last_edited_time', last_edited_time: { before: end } }
          ]
        },
        { property: 'Item', select: { equals: 'In Progress' } }
      ]
    } as QueryDatabaseParameters['filter'],
    sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
  })
  return pages.map(mapActionPage)
}

/**
 * Fetch projects for a single day:
 * - projects with a deadline on that day, OR
 * - projects with status Active (always visible)
 */
export async function getProjectsForDay(date: string) {
  const end = nextDay(date)
  const pages = await queryAll<ProjectNotionPage>(NOTION_DATABASES.projects, {
    filter: {
      or: [
        {
          and: [
            { property: 'Deadline', date: { on_or_after: date } },
            { property: 'Deadline', date: { before: end } }
          ]
        },
        { property: 'Status', select: { equals: 'Active' } }
      ]
    } as QueryDatabaseParameters['filter'],
    sorts: [{ property: 'Name', direction: 'ascending' }]
  })
  return pages.map(mapProjectPage)
}

/** Fetch tasks that belong to a specific project. */
export async function getTasksForProject(projectId: string) {
  const pages = await queryAll<ActionNotionPage>(NOTION_DATABASES.tasks, {
    filter: { property: 'Project', relation: { contains: projectId } },
    sorts: [{ property: 'Order', direction: 'ascending' }]
  })
  return pages.map(mapActionPage)
}

/** Fetch only billable tasks, optionally scoped to a project. */
export async function getBillableTasks(projectId?: string) {
  const filter: QueryDatabaseParameters['filter'] = projectId
    ? {
        and: [
          { property: 'Billable', checkbox: { equals: true } },
          { property: 'Project', relation: { contains: projectId } }
        ]
      }
    : { property: 'Billable', checkbox: { equals: true } }

  const pages = await queryAll<ActionNotionPage>(NOTION_DATABASES.tasks, {
    filter,
    sorts: [{ property: 'Order', direction: 'ascending' }]
  })
  return pages.map(mapActionPage)
}

/** Fetch all unique worker names from time entries, tasks, and projects (past 12 months). */
export async function getAllWorkerNames(): Promise<string[]> {
  const since = new Date()
  since.setFullYear(since.getFullYear() - 1)
  const sinceISO = since.toISOString()

  const [timeEntryPages, taskPages, projectPages] = await Promise.all([
    queryAll<TimeEntryNotionPage>(NOTION_DATABASES.timeEntries, {
      filter: { property: 'Start Time', date: { on_or_after: sinceISO } }
    }),
    queryAll<ActionNotionPage>(NOTION_DATABASES.tasks, {}),
    queryAll<ProjectNotionPage>(NOTION_DATABASES.projects, {}),
  ])

  const names = new Set<string>()
  for (const page of timeEntryPages) {
    for (const person of page.properties.Person.people) {
      if (person.name) names.add(person.name)
    }
  }
  for (const page of taskPages) {
    for (const person of page.properties.Owner.people) {
      if (person.name) names.add(person.name)
    }
  }
  for (const page of projectPages) {
    for (const person of page.properties.Owner.people) {
      if (person.name) names.add(person.name)
    }
  }
  return Array.from(names).sort()
}

