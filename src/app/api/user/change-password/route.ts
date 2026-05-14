import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/connect'
import { User } from '@/lib/db/models/user'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters' },
      { status: 400 }
    )
  }

  await connectToDatabase()
  const user = await User.findOne({ email: session.user.email })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.hashedPassword)
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  user.hashedPassword = await bcrypt.hash(newPassword, 12)
  await user.save()

  return NextResponse.json({ success: true })
}
