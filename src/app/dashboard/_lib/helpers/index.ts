import type { TimeEntry } from '@/types/time-entry'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'
import type { DateRange, Preset } from '../constants'

export function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getRangeForPreset(preset: Exclude<Preset, 'custom'>): DateRange {
  const now = new Date()

  if (preset === 'day') {
    const start = toISO(now)
    const end = toISO(new Date(now.getTime() + 86_400_000))
    return { start, end, label: 'Today' }
  }

  if (preset === 'week') {
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((day + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 7)
    return { start: toISO(monday), end: toISO(sunday), label: 'This week' }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start: toISO(start), end: toISO(end), label: 'This month' }
}

export function getInitialRange(preset: Exclude<Preset, 'custom'> = 'week'): DateRange {
  return getRangeForPreset(preset)
}

export function getPersonNames(
  timeEntries: TimeEntry[],
  tasks: Task[],
  projects: Project[]
): string[] {
  const names = new Set<string>()
  timeEntries.forEach((e) => (e.personNames.length ? e.personNames : ['Unassigned']).forEach((n) => names.add(n)))
  tasks.forEach((t) => (t.ownerNames.length ? t.ownerNames : ['Unassigned']).forEach((n) => names.add(n)))
  projects.forEach((p) => (p.ownerNames.length ? p.ownerNames : ['Unassigned']).forEach((n) => names.add(n)))
  const sorted = [...names].filter((n) => n !== 'Unassigned').sort()
  if (names.has('Unassigned')) sorted.push('Unassigned')
  return sorted
}

export function fmtDuration(minutes: number | null) {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`
}

export function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
