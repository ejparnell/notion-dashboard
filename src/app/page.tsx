import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Your Notion Dashboard
        </h1>
        <p className="mx-auto max-w-md text-base text-gray-500">
          A clean, personal dashboard that surfaces your Notion data — tasks,
          schedules, and more — in one place.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-md bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          Sign in
        </Link>
        <a
          href="https://notion.so"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Learn about Notion
        </a>
      </div>
    </main>
  )
}

