import type {
  ISODateString,
  NotionCheckboxProperty,
  NotionCreatedByProperty,
  NotionCreatedTimeProperty,
  NotionLastEditedByProperty,
  NotionLastEditedTimeProperty,
  NotionNumberProperty,
  NotionPage,
  NotionPageId,
  NotionPeopleProperty,
  NotionRelationProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUserId
} from './notion'

export type TaskStatus =
  | 'In Progress'
  | 'Todo'
  | 'Done'
  | 'Inbox'

export type TaskPriority =
  | 'High'
  | 'Medium'
  | 'Low'

export type TaskTimeEstimate =
  | '5 min'
  | '15 min'
  | '20 min'
  | '30 min'
  | '45 min'
  | '60 min'
  | '90 min'
  | '120'
  | '150'
  | '180'
  | '210'

export type ActionProperties = {
  Name: NotionTitleProperty
  Item: NotionSelectProperty<TaskStatus>
  Priority: NotionSelectProperty<TaskPriority>
  'Time Est': NotionSelectProperty<TaskTimeEstimate>
  Billable: NotionCheckboxProperty
  Owner: NotionPeopleProperty
  Project: NotionRelationProperty
  'SAFELY Plan': NotionRelationProperty
  Order: NotionNumberProperty
  'Created At': NotionCreatedTimeProperty
  'Created By': NotionCreatedByProperty
  'Updated At': NotionLastEditedTimeProperty
  'Updated By': NotionLastEditedByProperty
}

export type ActionNotionPage = NotionPage<ActionProperties>

export type Task = {
  id: NotionPageId
  name: string
  status: TaskStatus | null
  priority: TaskPriority | null
  timeEstimate: TaskTimeEstimate | null
  timeEstimateMinutes: number | null
  billable: boolean
  order: number | null
  ownerIds: NotionUserId[]
  ownerNames: string[]
  projectIds: NotionPageId[]
  safelyPlanIds: NotionPageId[]
  createdAt: ISODateString
  updatedAt: ISODateString
  notionUrl: string
}