'use client'
import { useState } from 'react'
import { useCompatibility } from '@/hooks/useCompatibility'
import { MingPanDisplay } from './MingPanDisplay'

export function MingPanCompare() {
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')
  const { loading, result, userA, userB, compare, error } = useCompatibility()

  return (
    <div className="space-y-8">
      <div className="max-w-md mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            value={nameA}
            onChange={e => setNameA(e.target.value)}
            placeholder="GitHub 用户 A"
            className="bg-[#0d0d20] border border-[#c9a84c40] rounded px-4 py-3
                       text-white placeholder-[#c9a84c30] focus:outline-none focus:border-[#c9a84c80]
                       text-sm"
          />
          <input
            value={nameB}
            onChange={e => setNameB(e.target.value)}
            placeholder="GitHub 用户 B"
            className="bg-[#0d0d20] border border-[#c9a84c40] rounded px-4 py-3
                       text-white placeholder-[#c9a84c30] focus:outline-none focus:border-[#c9a84c80]
                       text-sm"
          />
        </div>
        <button
          onClick={() => compare(nameA, nameB)}
          disabled={loading || !nameA || !nameB}
          className="w-full py-3 border border-[#c9a84c] rounded
                     bg-[#c9a84c10] hover:bg-[#c9a84c25] transition-all
                     disabled:opacity-40 text-sm font-bold tracking-[0.2em]"
        >
          {loading ? '星轨交汇中...' : '双 人 合 盘'}
        </button>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </div>

      {result && userA && userB && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* 契合度大盘 */}
          <div className="text-center space-y-4 border border-[#c9a84c40] rounded-xl p-8
                          bg-[#0a0a18] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r
                            from-transparent via-[#c9a84c] to-transparent opacity-40" />
            <div className="text-sm text-[#c9a84c60] tracking-widest">契合度</div>
            <div className="text-7xl font-bold text-[#f0d080] tracking-tighter">
              {result.score}<span className="text-2xl ml-1 opacity-60">%</span>
            </div>
            <div className="text-2xl font-bold text-[#f0d080]">{result.title}</div>
            <p className="text-[#c9a84c80] max-w-sm mx-auto leading-relaxed">
              「{result.desc}」
            </p>

            {/* 契合细节 */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#c9a84c15]">
              {[
                { label: '五行契合', value: result.aspects.element },
                { label: '作息共鸣', value: result.aspects.activity },
                { label: '语言同源', value: result.aspects.language },
              ].map(a => (
                <div key={a.label}>
                  <div className="text-[10px] text-[#c9a84c40] mb-2">{a.label}</div>
                  <div className="h-1 bg-[#c9a84c10] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c9a84c]"
                         style={{ width: `${a.value * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 两人的命盘对比 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="text-center font-bold text-[#f0d080] border-b
                              border-[#c9a84c20] pb-2 mb-4">
                {userA.username} 的星轨
              </div>
              <MingPanDisplay mingpan={userA} hideExport />
            </div>
            <div className="space-y-4">
              <div className="text-center font-bold text-[#f0d080] border-b
                              border-[#c9a84c20] pb-2 mb-4">
                {userB.username} 的星轨
              </div>
              <MingPanDisplay mingpan={userB} hideExport />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
