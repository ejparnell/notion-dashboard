import type { ActionNotionPage, Task, TaskTimeEstimate } from '@/types/task'
import type { Project, ProjectNotionPage } from '@/types/project'
import type { TimeEntry, TimeEntryNotionPage } from '@/types/time-entry'
import type { NotionTextContent } from '@/types/notion'

function getPlainText(text: NotionTextContent[]) {
  return text.map((item) => item.plain_text).join('')
}

function getMinutesFromEstimate(value: TaskTimeEstimate | null) {
  if (!value) return null

  const normalized = value.replace(' min', '')
  const minutes = Number(normalized)

  return Number.isNaN(minutes) ? null : minutes
}

function getDurationMinutes(start: string | null, end: string | null) {
  if (!start || !end) return null

  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null

  return Math.max(0, Math.round((endMs - startMs) / 1000 / 60))
}

export function mapTimeEntryPage(page: TimeEntryNotionPage): TimeEntry {
  const startTime = page.properties['Start Time'].date?.start ?? null
  const endTime = page.properties['End Time'].date?.start ?? null
  const durationMinutes = getDurationMinutes(startTime, endTime)

  return {
    id: page.id,
    title: getPlainText(page.properties['Time Entry'].title),
    startTime,
    endTime,
    personIds: page.properties.Person.people.map((person) => person.id),
    personNames: page.properties.Person.people.map((person) => person.name ?? 'Unknown'),
    durationMinutes,
    durationHours: durationMinutes === null ? null : durationMinutes / 60,
    isActive: Boolean(startTime && !endTime),
    notionUrl: page.url
  }
}

export function mapProjectPage(page: ProjectNotionPage): Project {
  return {
    id: page.id,
    name: getPlainText(page.properties.Name.title),
    status: page.properties.Status.select?.name ?? null,
    deadline: page.properties.Deadline.date?.start ?? null,
    ownerIds: page.properties.Owner.people.map((person) => person.id),
    ownerNames: page.properties.Owner.people.map((person) => person.name ?? 'Unknown'),
    clientIds: page.properties.Client.relation.map((item) => item.id),
    actionIds: page.properties.Actions.relation.map((item) => item.id),
    notionUrl: page.url
  }
}

export function mapActionPage(page: ActionNotionPage): Task {
  const timeEstimate = page.properties['Time Est'].select?.name ?? null

  return {
    id: page.id,
    name: getPlainText(page.properties.Name.title),
    status: page.properties.Item.select?.name ?? null,
    priority: page.properties.Priority.select?.name ?? null,
    timeEstimate,
    timeEstimateMinutes: getMinutesFromEstimate(timeEstimate),
    billable: page.properties.Billable.checkbox,
    order: page.properties.Order.number,
    ownerIds: page.properties.Owner.people.map((person) => person.id),
    ownerNames: page.properties.Owner.people.map((person) => person.name ?? 'Unknown'),
    projectIds: page.properties.Project.relation.map((item) => item.id),
    safelyPlanIds: page.properties['SAFELY Plan'].relation.map((item) => item.id),
    createdAt: page.properties['Created At'].created_time,
    updatedAt: page.properties['Updated At'].last_edited_time,
    notionUrl: page.url
  }
}
