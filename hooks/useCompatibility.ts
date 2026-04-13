import { useState, useCallback } from 'react'
import { fetchAllData } from '@/lib/github'
import { calculateMingPan } from '@/lib/mingpan'
import { calculateCompatibility, type CompatibilityResult } from '@/lib/compatibility'
import type { MingPan } from '@/lib/types'

export function useCompatibility() {
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<CompatibilityResult | null>(null)
  const [error, setError]     = useState('')
  const [userA, setUserA]     = useState<MingPan | null>(null)
  const [userB, setUserB]     = useState<MingPan | null>(null)

  const compare = useCallback(async (nameA: string, nameB: string) => {
    if (!nameA || !nameB) return
    setLoading(true); setError(''); setResult(null)
    try {
      const [dataA, dataB] = await Promise.all([
        fetchAllData(nameA),
        fetchAllData(nameB)
      ])
      const mpA = calculateMingPan(dataA)
      const mpB = calculateMingPan(dataB)
      setUserA(mpA)
      setUserB(mpB)
      setResult(calculateCompatibility(mpA, mpB))
    } catch (e) {
      setError(e instanceof Error ? e.message : '合盘推算失败')
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, result, error, userA, userB, compare }
}
