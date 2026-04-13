'use client'
import { useState } from 'react'
import { useMingPan } from '@/hooks/useMingPan'
import { MingPanDisplay } from '@/components/MingPanDisplay'
import { SolarTermBanner } from '@/components/SolarTermBanner'
import { MingPanCompare } from '@/components/MingPanCompare'
import { TeamMingPan } from '@/components/TeamMingPan'

type Tab = 'single' | 'compare' | 'team'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('single')
  const [username, setUsername] = useState('')
  const { status, mingpan, githubData, error, generate, reset } = useMingPan()

  return (
    <main className="min-h-screen bg-[#050510] text-[#c9a84c] font-serif px-4 pb-20 overflow-x-hidden">

      <header className="text-center pt-12 pb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-[0.3em] animate-in fade-in zoom-in duration-1000">
          GitHub 命盤
        </h1>
        <div className="flex justify-center mt-4">
        </div>
      </header>

      {/* 核心 Tab 切换 */}
      <div className="max-w-md mx-auto mb-10">
        <div className="flex bg-[#0d0d20] p-1 rounded-lg border border-[#c9a84c20]">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-2 text-sm rounded transition-all ${
              activeTab === 'single'
                ? 'bg-[#c9a84c] text-[#050510] font-bold shadow-lg'
                : 'text-[#c9a84c80] hover:text-[#c9a84c]'
            }`}
          >
            ☯ 单人起盘
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex-1 py-2 text-sm rounded transition-all ${
              activeTab === 'compare'
                ? 'bg-[#c9a84c] text-[#050510] font-bold shadow-lg'
                : 'text-[#c9a84c80] hover:text-[#c9a84c]'
            }`}
          >
            🤝 双人合盘
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-2 text-sm rounded transition-all ${
              activeTab === 'team'
                ? 'bg-[#c9a84c] text-[#050510] font-bold shadow-lg'
                : 'text-[#c9a84c80] hover:text-[#c9a84c]'
            }`}
          >
            🧑‍🤝‍🧑 团队星图
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div className="space-y-12">
          {/* 输入区域 */}
          <section className="max-w-sm mx-auto space-y-6">
            <div className="flex gap-2">
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate(username)}
                placeholder="GitHub 用户名"
                disabled={status === 'loading'}
                className="flex-1 bg-[#0d0d20] border border-[#c9a84c40] rounded
                           px-4 py-3 text-white placeholder-[#c9a84c30]
                           focus:outline-none focus:border-[#c9a84c80]
                           disabled:opacity-50 tracking-wider text-sm"
              />
              <button
                onClick={() => generate(username)}
                disabled={status === 'loading' || !username.trim()}
                className="px-5 py-3 border border-[#c9a84c] rounded
                           bg-[#c9a84c10] hover:bg-[#c9a84c25]
                           transition-all disabled:opacity-40 whitespace-nowrap text-sm"
              >
                {status === 'loading' ? <span className="animate-pulse">推算中</span> : '起 盘'}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2">
                <p className="text-red-400 text-sm flex-1">{error}</p>
                <button onClick={reset} className="text-xs text-[#c9a84c90] underline">重试</button>
              </div>
            )}


          </section>

          {/* 加载状态 */}
          {status === 'loading' && (
            <div className="text-center mt-20 space-y-4">
              <div className="text-5xl animate-spin inline-block text-[#f0d080]">☯</div>
              <p className="text-[#c9a84c70] animate-pulse tracking-widest">夜观星象，推算命盘...</p>
            </div>
          )}

          {/* 命盘展示 */}
          {mingpan && status === 'success' && (
            <section className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <MingPanDisplay mingpan={mingpan} />


              
              {/* 大运展示 */}
              <div className="border border-[#c9a84c20] rounded-xl p-6 bg-[#0a0a18] space-y-4">
                <h3 className="text-center text-sm font-bold text-[#c9a84c90] tracking-widest uppercase">── 命途大运 ──</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mingpan.dayun.map((d, i) => (
                    <div key={i} className="text-center p-3 border border-[#c9a84c10] rounded hover:border-[#c9a84c40] transition-colors">
                      <div className="text-[10px] text-[#c9a84c70] mb-1">{d.year}年起</div>
                      <div className="text-lg font-bold text-[#f0d080]">{d.name}大运</div>
                      <div className="text-[10px] text-[#c9a84c80] mt-1 leading-relaxed">{d.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button onClick={reset} className="px-6 py-3 border border-[#c9a84c20] rounded hover:bg-[#c9a84c08] transition-all text-sm text-[#c9a84c80]">重新起盘</button>
              </div>
              <SolarTermBanner />
            </section>
          )}
        </div>
      ) : activeTab === 'compare' ? (
        <section className="max-w-4xl mx-auto">
          <MingPanCompare />
        </section>
      ) : (
        <section className="max-w-4xl mx-auto">
          <TeamMingPan />
        </section>
      )}

      {/* 页脚 */}
      <footer className="mt-20 text-center space-y-2">
        <p className="text-[10px] text-[#c9a84c30] tracking-widest uppercase">
          © 2026 GitHub 命盘
        </p>
        <div className="flex justify-center gap-4 text-[10px] text-[#c9a84c20]">
          <span>星轨不居</span>
          <span>代码有灵</span>
          <span>开源永存</span>
        </div>
      </footer>
    </main>
  )
}
