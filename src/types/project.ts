import type {
  ISODateString,
  NotionDateProperty,
  NotionPage,
  NotionPageId,
  NotionPeopleProperty,
  NotionRelationProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUserId
} from './notion'

export type ProjectStatus =
  | 'Draft'
  | 'Active'
  | 'On Hold'
  | 'Done'
  | 'Dropped'
  | 'Ice Box'

export type ProjectProperties = {
  Name: NotionTitleProperty
  Status: NotionSelectProperty<ProjectStatus>
  Deadline: NotionDateProperty
  Owner: NotionPeopleProperty
  Client: NotionRelationProperty
  Actions: NotionRelationProperty
}

export type ProjectNotionPage = NotionPage<ProjectProperties>

export type Project = {
  id: NotionPageId
  name: string
  status: ProjectStatus | null
  deadline: ISODateString | null
  ownerIds: NotionUserId[]
  ownerNames: string[]
  clientIds: NotionPageId[]
  actionIds: NotionPageId[]
  notionUrl: string
}