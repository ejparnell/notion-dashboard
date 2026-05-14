import { NextRequest, NextResponse } from 'next/server'
import { getProjectsForDay } from '@/lib/notion/queries'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) {
    return NextResponse.json({ error: 'Missing date param' }, { status: 400 })
  }
  try {
    const projects = await getProjectsForDay(date)
    return NextResponse.json(projects)
  } catch (err) {
    console.error('[GET /api/notion/projects-for-day]', err)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
