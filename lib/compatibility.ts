import type { MingPan } from './types'

export interface CompatibilityResult {
  score: number // 0-100
  title: string
  desc: string
  aspects: {
    element: number
    activity: number
    language: number
  }
}

export function calculateCompatibility(userA: MingPan, userB: MingPan): CompatibilityResult {
  const aspects = {
    element:  calculateElementMatch(userA, userB),
    activity: calculateActivityMatch(userA, userB),
    language: calculateLanguageMatch(userA, userB),
  }

  const score = Math.round((aspects.element * 0.4 + aspects.activity * 0.3 + aspects.language * 0.3) * 100)
  const { title, desc } = getCompatibilityDescription(score)

  return { score, title, desc, aspects }
}

function calculateElementMatch(a: MingPan, b: MingPan): number {
  const e1 = a.benMingXiu.element
  const e2 = b.benMingXiu.element
  
  // 五行相生: 木->火->土->金->水->木
  const synergy: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  }
  
  if (e1 === e2) return 1.0 // 相同元素，高度契合
  if (synergy[e1] === e2 || synergy[e2] === e1) return 0.8 // 相生
  return 0.5 // 一般
}

function calculateActivityMatch(a: MingPan, b: MingPan): number {
  const diff = Math.abs(a.stats.lateNightRatio - b.stats.lateNightRatio)
  return Math.max(0, 1 - diff * 2) // 作息时间越近，契合度越高
}

function calculateLanguageMatch(a: MingPan, b: MingPan): number {
  return a.stats.topLanguage === b.stats.topLanguage ? 1.0 : 0.4
}

function getCompatibilityDescription(score: number): { title: string; desc: string } {
  if (score >= 90) return { title: '天作之合', desc: '星宿共鸣，代码轨迹如出一辙，乃是万中无一的黄金拍档。' }
  if (score >= 80) return { title: '心有灵犀', desc: '五行相生，协作流畅，定能共同攻克任何 Bug。' }
  if (score >= 60) return { title: '志同道合', desc: '虽有小异，但大局一致，是值得信赖的战友。' }
  return { title: '和而不同', desc: '各自闪耀，互补长短，在不同的星轨上各自精彩。' }
}
