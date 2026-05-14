'use client'

import { useEffect, useState } from 'react'

type Props = {
  workerName: string
  value: number
  onChange: (rate: number) => void
}

export default function PayRateInput({ workerName, value, onChange }: Props) {
  const storageKey = `billing_rate_${workerName}`
  const [input, setInput] = useState(String(value))

  // Sync input when worker changes
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    const parsed = stored ? parseFloat(stored) : value
    setInput(String(parsed))
    if (stored) onChange(parsed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerName])

  function handleChange(raw: string) {
    setInput(raw)
    const num = parseFloat(raw)
    if (!Number.isNaN(num) && num >= 0) {
      onChange(num)
      localStorage.setItem(storageKey, String(num))
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-gray-600 font-medium">Pay rate</span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-gray-400">
          $
        </span>
        <input
          type="number"
          min={0}
          step={0.5}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          className="w-28 rounded-lg border border-gray-300 bg-white pl-6 pr-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <span className="text-gray-400">/hr</span>
    </label>
  )
}
