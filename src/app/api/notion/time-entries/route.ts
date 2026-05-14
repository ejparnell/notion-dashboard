import { NextRequest, NextResponse } from 'next/server'
import { getTimeEntriesForPayPeriod } from '@/lib/notion/queries'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end query param' }, { status: 400 })
  }

  if (end <= start) {
    return NextResponse.json({ error: 'end must be after start' }, { status: 400 })
  }

  try {
    const entries = await getTimeEntriesForPayPeriod(start, end)
    return NextResponse.json(entries)
  } catch (err) {
    console.error('[GET /api/notion/time-entries]', err)
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
  }
}
