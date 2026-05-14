'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Sidebar from './sidebar'

const BARE_ROUTES = ['/', '/login']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const bare = status === 'loading' || !session || BARE_ROUTES.includes(pathname)

  if (bare) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
