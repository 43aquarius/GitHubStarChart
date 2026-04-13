'use client'
import type { StarPoint } from '@/lib/types'

interface Props {
  stars: StarPoint[]
  size?: number
}

export function YearWheel({ stars, size = 400 }: Props) {
  const CX = size / 2, CY = size / 2, R = size * 0.45

  // 按年份分组星点
  const starsByYear = stars.reduce((acc, s) => {
    const year = new Date(s.date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(s)
    return acc
  }, {} as Record<number, StarPoint[]>)

  const years = Object.keys(starsByYear).sort().reverse()

  return (
    <div className="relative mx-auto bg-[#0a0a18] border border-[#c9a84c20]
                    rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]"
         style={{ width: size, height: size }}>
      
      {/* 刻度背景 */}
      <div className="absolute inset-0 opacity-10">
        {[0.25, 0.5, 0.75, 1.0].map(ratio => (
          <div key={ratio}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          border border-[#c9a84c] rounded-full"
               style={{ width: size * ratio, height: size * ratio }} />
        ))}
      </div>

      {/* 活跃年份刻度 */}
      {years.map((year, i) => {
        const ratio = 1 - (i / years.length) * 0.7
        const r = R * ratio
        return (
          <div key={year} className="absolute inset-0">
            {starsByYear[parseInt(year)].map((s, idx) => {
              const rad = (s.angle / 360) * Math.PI * 2 - Math.PI / 2
              const x = CX + Math.cos(rad) * r
              const y = CY + Math.sin(rad) * r
              return (
                <div
                  key={idx}
                  className="absolute w-1 h-1 rounded-full bg-[#f0d080]"
                  style={{
                    left: x, top: y,
                    opacity: 0.1 + (s.brightness * 0.9),
                    boxShadow: s.brightness > 0.6 ? '0 0 4px #f0d080' : 'none'
                  }}
                />
              )
            })}
            {/* 年份标签 */}
            <div className="absolute text-[8px] text-[#c9a84c40] font-mono"
                 style={{ left: CX + 4, top: CY - r - 8 }}>
              {year}
            </div>
          </div>
        )
      })}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      text-[10px] text-[#c9a84c60] font-mono tracking-widest">
        年 轮 星 图
      </div>
    </div>
  )
}
