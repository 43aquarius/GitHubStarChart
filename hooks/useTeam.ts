import { useState, useCallback } from 'react'
import { fetchAllData }          from '@/lib/github'
import { calculateMingPan }      from '@/lib/mingpan'
import { calculateTeamMingPan }  from '@/lib/team'
import type { TeamMingPan }      from '@/lib/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useTeam() {
  const [status,   setStatus]   = useState<Status>('idle')
  const [team,     setTeam]     = useState<TeamMingPan | null>(null)
  const [error,    setError]    = useState<string>('')
  const [progress, setProgress] = useState<string>('')

  const generate = useCallback(async (usernames: string[]) => {
    const valid = usernames
      .map(u => u.trim())
      .filter(Boolean)
      .filter((u, i, arr) => arr.indexOf(u) === i)
    if (valid.length < 2) {
      setError('至少需要2名成员')
      return
    }
    if (valid.length > 8) {
      setError('最多支持8名成员')
      return
    }

    setStatus('loading'); setError(''); setTeam(null)

    try {
      // 逐个拉取并更新进度（并发可能触发GitHub限流）
      const members = []
      for (let i = 0; i < valid.length; i++) {
        const username = valid[i]
        setProgress(`正在推算 ${username}（${i + 1}/${valid.length}）`)
        const data    = await fetchAllData(username)
        const mingpan = calculateMingPan(data)
        members.push({ username, mingpan })
      }

      setTeam(calculateTeamMingPan(members))
      setStatus('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : '团队推算失败')
      setStatus('error')
    } finally {
      setProgress('')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle'); setTeam(null); setError(''); setProgress('')
  }, [])

  return { status, team, error, progress, generate, reset }
}
