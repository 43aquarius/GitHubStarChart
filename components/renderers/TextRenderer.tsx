// 最终兜底方案，零依赖，任何环境都能用
import type { MingPan } from '@/lib/types'

const PALACE_SYMBOL: Record<string, string> = {
  '东方青龙': '🐲',
  '北方玄武': '🐢',
  '西方白虎': '🐯',
  '南方朱雀': '🦅',
}

export function TextRenderer({ mingpan }: { mingpan: MingPan }) {
  const { benMingXiu, stats, piming, repos, stars, liuXing, huiXing } = mingpan

  // 用ASCII字符模拟圆形
  const asciiRing = [
    '        ✦ 东方青龙 ✦        ',
    '   ┌─────────────────────┐   ',
    ' ✦ │  角 亢 氐 房 心 尾 箕  │ ✦',
    '   │                     │   ',
    '北 │  斗 牛 女 虚 危 室 壁  │ 南',
    '玄 │                     │ 朱',
    '武 │  奎 娄 胃 昴 毕 觜 参  │ 雀',
    '   │                     │   ',
    ' ✦ │  井 鬼 柳 星 张 翼 轸  │ ✦',
    '   └─────────────────────┘   ',
    '        ✦ 西方白虎 ✦        ',
  ]

  return (
    <div className="font-mono text-[#c9a84c] space-y-6 max-w-lg mx-auto">

      {/* ASCII星图 */}
      <div className="border border-[#c9a84c30] rounded-lg p-4 bg-[#0a0a18]">
        <pre className="text-xs leading-relaxed text-center text-[#c9a84c60]">
          {asciiRing.join('\n')}
        </pre>
      </div>

      {/* 本命宿 */}
      <div className="border border-[#c9a84c] rounded-lg p-6 text-center bg-[#0a0a18]">
        <div className="text-4xl mb-2">
          {PALACE_SYMBOL[benMingXiu.palace] ?? '✦'}
        </div>
        <div className="text-2xl font-bold text-[#f0d080]">{benMingXiu.name}</div>
        <div className="text-sm text-[#c9a84c80] mt-1">{benMingXiu.palace}</div>
        <div className="text-xs text-[#c9a84c50] mt-2">{benMingXiu.desc}</div>
      </div>

      {/* 批命文案 */}
      <div className="border border-[#c9a84c40] rounded-lg p-4 bg-[#0a0a18] text-center">
        <p className="text-[#f0d080] leading-relaxed text-sm">「{piming}」</p>
      </div>

      {/* 星象数据 */}
      <div className="border border-[#c9a84c20] rounded-lg p-4 bg-[#0a0a18] space-y-3">
        <div className="text-xs text-[#c9a84c60] border-b border-[#c9a84c20] pb-2">
          ── 星象数据 ──
        </div>
        {[
          { icon: '⭐', label: '本年commit星', value: `${stars.length} 颗` },
          { icon: '🌠', label: 'PR流星', value: `${liuXing.length} 道` },
          { icon: '☄️', label: 'Issue彗星', value: `${huiXing.length} 颗` },
          { icon: '🔥', label: '最长连提', value: `${stats.longestStreak} 日` },
          { icon: '🌙', label: '深夜渡劫', value: `${Math.round(stats.lateNightRatio * 100)}%` },
          { icon: '📅', label: '最活跃日', value: stats.mostActiveDay },
          { icon: '💻', label: '本命语言', value: stats.topLanguage },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-[#c9a84c80]">{icon} {label}</span>
            <span className="text-[#f0d080] font-bold">{value}</span>
          </div>
        ))}
      </div>

      {/* 星宿列表 */}
      <div className="border border-[#c9a84c20] rounded-lg p-4 bg-[#0a0a18]">
        <div className="text-xs text-[#c9a84c60] border-b border-[#c9a84c20] pb-2 mb-3">
          ── 你的星宿 ──
        </div>
        <div className="grid grid-cols-2 gap-2">
          {repos.slice(0, 8).map(rs => (
            <div key={rs.repo.id}
              className={`text-xs p-2 rounded border ${rs.isMainStar
                  ? 'border-[#c9a84c] text-[#f0d080]'
                  : 'border-[#c9a84c20] text-[#c9a84c60]'
                }`}>
              <div className="font-bold">{rs.xiu.name}</div>
              <div className="truncate opacity-60">{rs.repo.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
