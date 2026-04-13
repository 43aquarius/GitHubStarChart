'use client'
import type { Achievement } from '@/lib/types'

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const { name, icon, desc, unlocked } = achievement

  return (
    <div className={`relative group border rounded-lg p-3 transition-all ${
      unlocked
        ? 'border-[#c9a84c] bg-[#c9a84c10] text-[#f0d080]'
        : 'border-[#c9a84c10] bg-[#0d0d20] text-[#c9a84c30]'
    }`}>
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>{icon}</span>
        <div className="flex-1">
          <div className="text-sm font-bold truncate">{name}</div>
          <div className="text-[10px] opacity-60 truncate">{desc}</div>
        </div>
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#f0d080] rounded-full shadow-[0_0_8px_#f0d080]" />
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                      bg-[#1a1a3e] border border-[#c9a84c40] rounded text-xs
                      whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none z-50 text-white">
        {unlocked ? `已解锁: ${desc}` : `条件: ${achievement.condition}`}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8
                        border-transparent border-t-[#c9a84c40]" />
      </div>
    </div>
  )
}