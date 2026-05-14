export default function TimeEntriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-40 rounded bg-gray-200" />
      <div className="flex gap-3">
        <div className="h-10 w-48 rounded bg-gray-200" />
        <div className="h-10 w-72 rounded bg-gray-200" />
        <div className="h-10 w-28 rounded bg-gray-200" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  )
}
