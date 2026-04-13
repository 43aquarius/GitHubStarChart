'use client'
import { useState } from 'react'
import { useTeam } from '@/hooks/useTeam'
import { SvgRenderer } from '@/components/renderers/SvgRenderer'
import { getPairCompat } from '@/lib/team'

function compatColor(score: number): string {
  if (score >= 75) return 'bg-[#4a9e6b30] text-[#4a9e6b]'
  if (score >= 55) return 'bg-[#c9a84c20] text-[#c9a84c]'
  return 'bg-[#9e4a4a30] text-[#9e4a4a]'
}

export function TeamMingPan() {
  const [inputText, setInputText] = useState('')
  const { status, team, error, progress, generate, reset } = useTeam()

  const handleGenerate = () => {
    const usernames = inputText
      .split(/[\n,，\s]+/)
      .map(u => u.trim())
      .filter(Boolean)
    generate(usernames)
  }

  return (
    <div className="space-y-6">
      <div className="max-w-lg mx-auto space-y-3">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`输入GitHub用户名，每行一个（最多8人）\n例如：\ntorvalds\ngvanrossum\ndhh`}
          rows={5}
          className="w-full bg-[#0d0d20] border border-[#c9a84c40] rounded px-4 py-3 text-white placeholder-[#c9a84c50] focus:outline-none focus:border-[#c9a84c80] text-sm font-mono resize-none"
        />
        <button
          onClick={handleGenerate}
          disabled={status === 'loading' || !inputText.trim()}
          className="w-full py-3 border border-[#c9a84c] rounded bg-[#c9a84c10] hover:bg-[#c9a84c25] transition-all disabled:opacity-40 text-sm"
        >
          {status === 'loading' ? (
            <span className="animate-pulse">{progress || '推算中...'}</span>
          ) : '团队起盘'}
        </button>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      {team && status === 'success' && (
        <div className="space-y-8">
          <div className="border border-[#c9a84c] rounded-lg p-6 bg-[#0a0a18] text-center">
            <div className="text-xs text-[#c9a84c80] mb-3">── 团队命格 ──</div>
            <div className="text-sm text-[#c9a84c90] mb-2">
              {team.teamType} · 主导五行：{team.dominantElement}
            </div>
            <p className="text-[#f0d080] text-sm leading-relaxed">「{team.teamPiming}」</p>
          </div>

          <div className="border border-[#c9a84c20] rounded-lg p-4 bg-[#0a0a18]">
            <div className="text-xs text-[#c9a84c80] mb-3">── 团队五行分布 ──</div>
            <div className="space-y-2">
              {team.elementDist.map(({ element, count, ratio }) => (
                <div key={element} className="flex items-center gap-3">
                  <span className="text-xs w-8 text-[#c9a84c90]">{element}</span>
                  <div className="flex-1 h-2 bg-[#c9a84c10] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c9a84c] rounded-full transition-all"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#c9a84c70] w-8">{count}人</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.members.map(({ username, mingpan }) => (
              <div key={username} className="space-y-2">
                <p className="text-center text-sm text-[#c9a84c90]">
                  {username} · {mingpan.benMingXiu.name}
                </p>
                <SvgRenderer mingpan={mingpan} />
              </div>
            ))}
          </div>

          {team.members.length >= 2 && (
            <div className="border border-[#c9a84c20] rounded-lg p-4 bg-[#0a0a18] overflow-x-auto">
              <div className="text-xs text-[#c9a84c80] mb-3">── 两两相性矩阵 ──</div>
              <table className="text-xs w-full">
                <thead>
                  <tr>
                    <th className="text-[#c9a84c60] text-left p-1 w-20">─</th>
                    {team.members.map(m => (
                      <th
                        key={m.username}
                        className="text-[#c9a84c80] p-1 text-center max-w-[60px] truncate"
                      >
                        {m.username.slice(0, 8)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {team.members.map(rowM => (
                    <tr key={rowM.username}>
                      <td className="text-[#c9a84c80] p-1 truncate max-w-[80px]">
                        {rowM.username.slice(0, 8)}
                      </td>
                      {team.members.map(colM => {
                        if (rowM.username === colM.username) {
                          return (
                            <td key={colM.username} className="text-center p-1 text-[#c9a84c30]">
                              —
                            </td>
                          )
                        }
                        const score = getPairCompat(team.compatMatrix, rowM.username, colM.username)
                        return (
                          <td key={colM.username} className="p-1 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${compatColor(score)}`}>
                              {score}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 flex gap-4 text-xs">
                <span className="text-[#4a9e6b]">
                  ✦ 最佳配对：{team.strongestPair[0]} &amp; {team.strongestPair[1]}
                </span>
                <span className="text-[#9e4a4a]">
                  ⚠ 需磨合：{team.weakestPair[0]} &amp; {team.weakestPair[1]}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="mx-auto block px-6 py-2 text-xs text-[#c9a84c80] border border-[#c9a84c20] rounded hover:bg-[#c9a84c08]"
          >
            重新起盘
          </button>
        </div>
      )}
    </div>
  )
}

