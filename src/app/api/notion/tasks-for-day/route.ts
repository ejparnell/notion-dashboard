import { NextRequest, NextResponse } from 'next/server'
import { getTasksForDay } from '@/lib/notion/queries'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) {
    return NextResponse.json({ error: 'Missing date param' }, { status: 400 })
  }
  try {
    const tasks = await getTasksForDay(date)
    return NextResponse.json(tasks)
  } catch (err) {
    console.error('[GET /api/notion/tasks-for-day]', err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}
