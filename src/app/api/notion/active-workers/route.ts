import { NextResponse } from 'next/server'
import { getActiveTimeEntries } from '@/lib/notion/queries'

export async function GET() {
  try {
    const entries = await getActiveTimeEntries()
    return NextResponse.json(entries)
  } catch (err) {
    console.error('[GET /api/notion/active-workers]', err)
    return NextResponse.json({ error: 'Failed to fetch active workers' }, { status: 500 })
  }
}
