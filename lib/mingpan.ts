import type { GitHubData, MingPan, StarPoint, MeteorPoint, CometPoint, RepoStar, UserStats, XiuData, Achievement, GuardianSpirit } from './types'
import { XIU_DATA } from './data/xiu'
import { PIMING_DATA } from './data/piming'
import { ACHIEVEMENTS } from './data/achievements'
import { GUARDIANS } from './data/guardians'
import { seededRandom, usernameToSeed } from './utils'
import { calculateStarHealth } from './starHealth'
import { calculateMajorCycles } from './dayun'

export function calculateMingPan(data: GitHubData): MingPan {
  const stats = calculateStats(data)
  const repos = assignReposToXiu(data)
  const benMingXiu = repos[0]?.xiu ?? XIU_DATA[0]
  const userType = classifyUser(stats, data)
  
  const initialStars = generateStars(data)
  const { updatedStars, overallHealth } = calculateStarHealth(initialStars)

  return {
    username: data.username,
    avatarUrl: data.avatarUrl,
    benMingXiu,
    repos,
    stars: updatedStars,
    liuXing: generateMeteors(data.pullRequestCount),
    huiXing: generateComets(data.issueCount),
    piming: generatePiming(data, benMingXiu, stats, userType),
    userType,
    stats,
    // --- 养成系统 ---
    starHealth: overallHealth,
    achievements: calculateAchievements(data, stats),
    guardian: assignGuardian(benMingXiu, stats),
    dayun: calculateMajorCycles(data.createdAt || new Date().toISOString()),
  }
}

function assignReposToXiu(data: GitHubData): RepoStar[] {
  const sorted = [...data.repos].sort((a, b) =>
    (b.stargazers_count * 2 + b.size / 100) - (a.stargazers_count * 2 + a.size / 100)
  )
  const offset = usernameToSeed(data.username) % 28
  return sorted.map((repo, i) => ({
    repo,
    xiu: XIU_DATA[(i + offset) % 28],
    isMainStar: i === 0,
  }))
}

function generateStars(data: GitHubData): StarPoint[] {
  const rng = seededRandom(usernameToSeed(data.username))
  return data.contributions
    .filter(d => d.count > 0)
    .map(d => {
      const date = new Date(d.date)
      const dayOfYear = Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
      )
      const baseAngle = (dayOfYear / 365) * 360
      const normalized = Math.log(d.count + 1) / Math.log(20)
      return {
        angle: (baseAngle + (rng() - 0.5) * 10 + 360) % 360,
        radius: 0.25 + normalized * 0.6,
        brightness: Math.min(normalized + 0.2, 1),
        date: d.date,
        count: d.count,
      }
    })
}

function generateMeteors(prCount: number): MeteorPoint[] {
  return Array.from({ length: Math.min(prCount, 12) }, (_, i) => ({
    angle: (i * 137.5) % 360,
    length: 30 + (i % 3) * 20,
  }))
}

function generateComets(issueCount: number): CometPoint[] {
  return Array.from({ length: Math.min(issueCount, 8) }, (_, i) => ({
    angle: (i * 137.5 + 60) % 360,
    radius: 0.5 + (i % 3) * 0.1,
  }))
}

function calculateStats(data: GitHubData): UserStats {
  let maxStreak = 0, cur = 0, maxDark = 0, curDark = 0
  const weekdays = Array(7).fill(0)

  data.contributions.forEach(d => {
    if (d.count > 0) {
      cur++; maxStreak = Math.max(maxStreak, cur)
      curDark = 0
      weekdays[d.weekday] += d.count
    } else {
      curDark++; maxDark = Math.max(maxDark, curDark)
      cur = 0
    }
  })

  const startYear = data.createdAt ? new Date(data.createdAt).getFullYear() : new Date().getFullYear()
  const currentYear = new Date().getFullYear()

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return {
    totalCommits: data.totalCommits,
    lateNightRatio: data.lateNightRatio,
    longestStreak: maxStreak,
    darkDays: maxDark,
    topLanguage: data.topLanguage,
    mostActiveDay: dayNames[weekdays.indexOf(Math.max(...weekdays))],
    mostActiveHour: 22,
    accountAgeYears: currentYear - startYear + 1
  }
}

function classifyUser(stats: UserStats, data: GitHubData): string {
  if (stats.lateNightRatio > 0.4) return 'lateNight'
  if (stats.longestStreak > 60)   return 'streak'
  if (stats.darkDays > 60)        return 'dark'
  if (data.issueCount > 15)       return 'issue'
  if (data.pullRequestCount > 10) return 'pr'
  if (stats.totalCommits > 500)   return 'prolific'
  return 'normal'
}

function generatePiming(data: GitHubData, xiu: XiuData, stats: UserStats, userType: string): string {
  const templates = PIMING_DATA[userType] ?? PIMING_DATA['normal']
  const seed = usernameToSeed(data.username)
  return (templates[seed % templates.length])
    .replaceAll('{xiu}',    xiu.name)
    .replaceAll('{lang}',   stats.topLanguage)
    .replaceAll('{streak}', String(stats.longestStreak))
    .replaceAll('{palace}', xiu.palace)
    .replaceAll('{day}',    stats.mostActiveDay)
    .replaceAll('{dark}',   String(stats.darkDays))
    .replaceAll('{total}',  String(stats.totalCommits))
}

function calculateAchievements(data: GitHubData, stats: UserStats): Achievement[] {
  return ACHIEVEMENTS.map(ach => {
    let unlocked = false
    switch (ach.id) {
      case 'midnight_guardian': unlocked = stats.lateNightRatio > 0.4; break
      case 'streak_master':     unlocked = stats.longestStreak > 100; break
      case 'bug_hunter':        unlocked = data.issueCount > 20; break
      case 'polyglot':          unlocked = data.repos.length > 10; break // 简化判断
      case 'maintainer':        unlocked = data.repos.length > 10; break
      case 'pioneer':           unlocked = data.repos.filter(r => !r.fork).length > 5; break
      case 'legendary':         unlocked = stats.totalCommits > 5000; break
    }
    return { ...ach, unlocked }
  })
}

function assignGuardian(xiu: XiuData, stats: UserStats): GuardianSpirit {
  if (xiu.palace.includes('青龙')) return GUARDIANS[0]
  if (xiu.palace.includes('玄武')) return GUARDIANS[1]
  if (xiu.palace.includes('白虎')) return GUARDIANS[2]
  if (xiu.palace.includes('朱雀')) return GUARDIANS[3]
  return GUARDIANS[4]
}
