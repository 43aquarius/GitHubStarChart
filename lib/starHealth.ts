import type { DayData, StarPoint } from './types'

/**
 * 计算星点健康度 (0-1)
 * 根据离今天的距离进行指数衰减
 */
export function calculateStarHealth(stars: StarPoint[]): {
  updatedStars: StarPoint[]
  overallHealth: number
} {
  const now = new Date().getTime()
  const ONE_DAY = 24 * 60 * 60 * 1000
  const DECAY_DAYS = 90 // 90天后衰减到极低

  let totalHealth = 0
  const updatedStars = stars.map(star => {
    const starTime = new Date(star.date).getTime()
    const daysDiff = (now - starTime) / ONE_DAY
    
    // 指数衰减函数: e^(-x/k)
    const health = Math.exp(-daysDiff / (DECAY_DAYS / 2))
    totalHealth += health
    
    return { ...star, health }
  })

  const overallHealth = stars.length > 0 ? totalHealth / stars.length : 0
  return { updatedStars, overallHealth }
}

/**
 * 判断是否处于“星陨”状态 (长期不活跃)
 */
export function isStarFalling(overallHealth: number): boolean {
  return overallHealth < 0.1
}
