import type { MajorCycle } from './types'

const CYCLES = [
  { name: '甲子', desc: '初出茅庐，代码之路如履薄冰，然志存高远。' },
  { name: '乙丑', desc: '勤恳务实，基础库与框架已是信手拈来。' },
  { name: '丙寅', desc: '猛虎出山，重构与开创皆不在话下。' },
  { name: '丁卯', desc: '灵动跳跃，逻辑思维如兔般敏捷。' },
  { name: '戊辰', desc: '巨龙腾空，不仅精于代码，更兼具大局观。' },
  { name: '己巳', desc: '深藏不露，Bug 在你面前无处遁形。' },
  { name: '庚午', desc: '千里奔袭，持续的高产出让众人叹服。' },
  { name: '辛未', desc: '温润如玉，代码风格优雅且极具可读性。' },
]

/**
 * 根据 GitHub 账号创建年份计算大运
 * 每 7 年一个大运 (简化的中国玄学模型)
 */
export function calculateMajorCycles(createdAt: string): MajorCycle[] {
  const startYear = new Date(createdAt).getFullYear()
  const currentYear = new Date().getFullYear()
  const ageYears = currentYear - startYear + 1
  const cyclesCount = Math.ceil(ageYears / 7)

  const result: MajorCycle[] = []
  for (let i = 0; i < Math.max(cyclesCount, 3); i++) {
    const start = startYear + i * 7
    const cycleIdx = (startYear + i) % CYCLES.length
    result.push({
      year: start,
      name: CYCLES[cycleIdx].name,
      desc: CYCLES[cycleIdx].desc
    })
  }

  return result
}
