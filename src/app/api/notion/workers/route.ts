import { NextResponse } from 'next/server'
import { getAllWorkerNames } from '@/lib/notion/queries'

export async function GET() {
  try {
    const workers = await getAllWorkerNames()
    return NextResponse.json(workers)
  } catch (err) {
    console.error('[/api/notion/workers]', err)
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 })
  }
}
