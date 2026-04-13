'use client'
import { useState, useEffect } from 'react'
import { getTodaySolarTerm } from '@/lib/data/solarTerms'
import type { SolarTerm } from '@/lib/data/solarTerms'

export function SolarTermBanner() {
  const [term, setTerm] = useState<SolarTerm | null>(null)

  // useEffect避免服务端/客户端时间不一致导致hydration warning
  useEffect(() => {
    setTerm(getTodaySolarTerm())
  }, [])

  if (!term) return null
  return (
    <div className="text-center py-4 border-t border-[#c9a84c15]">
      <span className="text-sm text-[#c9a84c50]">
        今日{term.name} · {term.advice}
      </span>
    </div>
  )
}
