import { NextRequest, NextResponse } from 'next/server'
import { getProjectsForPeriod } from '@/lib/notion/queries'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end query params are required' }, { status: 400 })
  }

  try {
    const projects = await getProjectsForPeriod(start, end)
    return NextResponse.json(projects)
  } catch (err) {
    console.error('[/api/notion/projects]', err)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
