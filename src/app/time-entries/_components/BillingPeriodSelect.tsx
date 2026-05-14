'use client'

export type BillingPreset = 'day' | 'week' | 'month' | 'custom'

type Props = {
  value: BillingPreset
  onChange: (preset: BillingPreset) => void
}

const PRESETS: { label: string; value: BillingPreset }[] = [
  { label: 'Today', value: 'day' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'Custom', value: 'custom' },
]

export default function BillingPeriodSelect({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === p.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
