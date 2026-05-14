'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-4">
      <Link href={session ? '/dashboard' : '/'} className="text-sm font-semibold text-gray-900">
        Notion Dashboard
      </Link>
    </header>
  )
}
