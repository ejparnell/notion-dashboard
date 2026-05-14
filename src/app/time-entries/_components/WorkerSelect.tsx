'use client'

type Props = {
  workers: string[]
  value: string
  onChange: (worker: string) => void
}

export default function WorkerSelect({ workers, value, onChange }: Props) {
  return (
    <select
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {workers.map((w) => (
        <option key={w} value={w}>
          {w}
        </option>
      ))}
    </select>
  )
}
