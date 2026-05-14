'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface NavItem {
  label: string
  href: string
}

interface NavGroup {
  heading: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    heading: 'Dashboard',
    items: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'Today', href: '/dashboard/today' },
      { label: 'Weekly', href: '/dashboard/weekly' },
    ],
  },
  {
    heading: 'Time',
    items: [
      { label: 'Time Entries', href: '/time-entries' },
    ],
  },
]

// Routes where the sidebar should not appear
const HIDDEN_ON = ['/', '/login']

export default function Sidebar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const hide =
    status === 'loading' ||
    !session ||
    HIDDEN_ON.includes(pathname)

  if (hide) return null

  return (
    <aside className="
      hidden md:flex
      w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50
      min-h-[calc(100vh-3.5rem)]
    ">
      <nav className="sticky top-14 flex flex-col gap-0 overflow-y-auto p-3 h-[calc(100vh-3.5rem)]">
        <div className="flex-1">
          {navGroups.map((group) => (
            <div key={group.heading} className="mb-4">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ label, href }) => {
                  const active =
                    href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === href || pathname.startsWith(href + '/')

                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`
                          flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
                          ${active
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }
                        `}
                      >
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-3">
          {session?.user && (
            <p className="truncate px-3 pb-2 text-xs text-gray-400">
              {session.user.name ?? session.user.email}
            </p>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </nav>
    </aside>
  )
}
