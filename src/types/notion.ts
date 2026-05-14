export type NotionId = string
export type ISODateString = string
export type NotionPageId = string
export type NotionUserId = string

export type NotionColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'

export type NotionTextContent = {
  plain_text: string
  href: string | null
}

export type NotionTitleProperty = {
  id: string
  type: 'title'
  title: NotionTextContent[]
}

export type NotionDateValue = {
  start: ISODateString
  end: ISODateString | null
  time_zone: string | null
}

export type NotionDateProperty = {
  id: string
  type: 'date'
  date: NotionDateValue | null
}

export type NotionSelectValue<TName extends string = string> = {
  id: string
  name: TName
  color: NotionColor
}

export type NotionSelectProperty<TName extends string = string> = {
  id: string
  type: 'select'
  select: NotionSelectValue<TName> | null
}

export type NotionCheckboxProperty = {
  id: string
  type: 'checkbox'
  checkbox: boolean
}

export type NotionNumberProperty = {
  id: string
  type: 'number'
  number: number | null
}

export type NotionPerson = {
  object: 'user'
  id: NotionUserId
  name?: string | null
  avatar_url?: string | null
  type?: string
  person?: {
    email?: string
  }
}

export type NotionPeopleProperty = {
  id: string
  type: 'people'
  people: NotionPerson[]
}

export type NotionRelationValue = {
  id: NotionPageId
}

export type NotionRelationProperty = {
  id: string
  type: 'relation'
  relation: NotionRelationValue[]
  has_more?: boolean
}

export type NotionCreatedTimeProperty = {
  id: string
  type: 'created_time'
  created_time: ISODateString
}

export type NotionLastEditedTimeProperty = {
  id: string
  type: 'last_edited_time'
  last_edited_time: ISODateString
}

export type NotionCreatedByProperty = {
  id: string
  type: 'created_by'
  created_by: NotionPerson
}

export type NotionLastEditedByProperty = {
  id: string
  type: 'last_edited_by'
  last_edited_by: NotionPerson
}

export type NotionPage<TProperties> = {
  object: 'page'
  id: NotionPageId
  created_time: ISODateString
  last_edited_time: ISODateString
  archived: boolean
  in_trash?: boolean
  url: string
  properties: TProperties
}