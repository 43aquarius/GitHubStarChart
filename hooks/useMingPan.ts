import { useState, useCallback } from 'react'
import { fetchAllData } from '@/lib/github'
import { calculateMingPan } from '@/lib/mingpan'
import type { MingPan, GitHubData } from '@/lib/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useMingPan() {
  const [status, setStatus] = useState<Status>('idle')
  const [mingpan, setMingpan] = useState<MingPan | null>(null)
  const [githubData, setGithubData] = useState<GitHubData | null>(null)
  const [error, setError] = useState<string>('')

  const generate = useCallback(async (username: string) => {
    if (!username.trim()) return
    setStatus('loading'); setError(''); setMingpan(null); setGithubData(null)
    try {
      const data = await fetchAllData(username.trim())
      setGithubData(data)
      setMingpan(calculateMingPan(data))
      setStatus('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : '推算失败，请稍后再试')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle'); setMingpan(null); setGithubData(null); setError('')
  }, [])

  return { status, mingpan, githubData, error, generate, reset }
}
