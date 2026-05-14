import type { Task } from '@/types/task'
import type { Project } from '@/types/project'

export type DateRange = {
  start: string  // ISO date string YYYY-MM-DD
  end: string    // ISO date string YYYY-MM-DD (exclusive)
  label: string
}

export type Preset = 'day' | 'week' | 'month' | 'custom'

export const PRESETS: { value: Preset; label: string }[] = [
  { value: 'day',    label: 'Today' },
  { value: 'week',   label: 'This week' },
  { value: 'month',  label: 'This month' },
  { value: 'custom', label: 'Custom' },
]

export const STATUS_ORDER: Array<Task['status']> = ['In Progress', 'Todo', 'Inbox', 'Done']

export const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'Todo': 'bg-yellow-100 text-yellow-700',
  'Done': 'bg-green-100 text-green-700',
  'Inbox': 'bg-gray-100 text-gray-600',
}

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Draft': 'bg-gray-100 text-gray-600',
  'On Hold': 'bg-yellow-100 text-yellow-700',
  'Done': 'bg-blue-100 text-blue-700',
  'Dropped': 'bg-red-100 text-red-600',
  'Ice Box': 'bg-slate-100 text-slate-500',
}

export type { Project }
