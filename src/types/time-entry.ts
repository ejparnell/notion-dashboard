import type {
  ISODateString,
  NotionDateProperty,
  NotionPage,
  NotionPageId,
  NotionPeopleProperty,
  NotionTitleProperty,
  NotionUserId
} from './notion'

export type TimeEntryProperties = {
  'Time Entry': NotionTitleProperty
  'Start Time': NotionDateProperty
  'End Time': NotionDateProperty
  Person: NotionPeopleProperty
}

export type TimeEntryNotionPage = NotionPage<TimeEntryProperties>

export type TimeEntry = {
  id: NotionPageId
  title: string
  startTime: ISODateString | null
  endTime: ISODateString | null
  personIds: NotionUserId[]
  personNames: string[]
  durationMinutes: number | null
  durationHours: number | null
  isActive: boolean
  notionUrl: string
}