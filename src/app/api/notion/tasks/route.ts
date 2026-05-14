import { NextRequest, NextResponse } from 'next/server'
import { getTasksForPeriod } from '@/lib/notion/queries'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end query params are required' }, { status: 400 })
  }

  try {
    const tasks = await getTasksForPeriod(start, end)
    return NextResponse.json(tasks)
  } catch (err) {
    console.error('[/api/notion/tasks]', err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}
