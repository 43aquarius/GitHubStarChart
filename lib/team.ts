import type {
  MingPan, TeamMember, TeamMingPan,
  TeamElementDist, TeamCompatMatrix,
} from './types'
import { calculateCompatibility } from './compatibility'
import { usernameToSeed, seededRandom } from './utils'

// 团队类型判断（根据五行主导）
const TEAM_TYPE: Record<string, string> = {
  木: '创造开拓型',
  火: '执行冲刺型',
  土: '稳健维护型',
  金: '精益求精型',
  水: '灵活适应型',
  日: '洞察驱动型',
  月: '协调共生型',
}

// 团队批命模板
const TEAM_PIMING_TEMPLATES = [
  '此队{count}人，{dominantElement}气主导，{teamType}。{strongA}与{strongB}相性最佳，宜担任核心配对；{weakA}与{weakB}需多沟通，忌单独负责同一模块。整体星力{avgCompat}分，{verdict}。',
  '团队命格：{dominantElement}星云聚，{count}宿共振，乃{teamType}之象。{strongA}、{strongB}二人共振最强，可担架构重任；{weakA}、{weakB}相克需调解。宜定期代码Review，忌各自为政。',
  '{count}人团队，{dominantElement}气流转，主{teamType}。强强联合者：{strongA}与{strongB}；需要磨合者：{weakA}与{weakB}。综合相性{avgCompat}分，{verdict}。',
]

export function calculateTeamMingPan(members: TeamMember[]): TeamMingPan {
  if (members.length === 0) {
    throw new Error('团队成员不能为空')
  }

  // 1. 五行分布
  const elementCount: Record<string, number> = {}
  members.forEach(m => {
    const el = m.mingpan.benMingXiu.element
    elementCount[el] = (elementCount[el] ?? 0) + 1
  })
  const elementDist: TeamElementDist[] = Object.entries(elementCount)
    .sort((a, b) => b[1] - a[1])
    .map(([element, count]) => ({
      element,
      count,
      ratio: count / members.length,
    }))
  const dominantElement = elementDist[0]?.element ?? '木'

  // 2. 两两相性矩阵
  const compatMatrix: TeamCompatMatrix = {}
  let totalCompat = 0
  let pairCount   = 0
  let maxCompat   = -1, minCompat = 101
  let strongestPair: [string, string] = [members[0]?.username ?? '', members[1]?.username ?? '']
  let weakestPair:   [string, string] = [members[0]?.username ?? '', members[1]?.username ?? '']

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i]
      const b = members[j]
      const key    = `${a.username}-${b.username}`
      const result = calculateCompatibility(a.mingpan, b.mingpan)
      compatMatrix[key] = result.score
      totalCompat += result.score
      pairCount++

      if (result.score > maxCompat) {
        maxCompat      = result.score
        strongestPair  = [a.username, b.username]
      }
      if (result.score < minCompat) {
        minCompat     = result.score
        weakestPair   = [a.username, b.username]
      }
    }
  }

  const avgCompat = pairCount > 0
    ? Math.round(totalCompat / pairCount)
    : 80

  // 3. 团队类型
  const teamType = TEAM_TYPE[dominantElement] ?? '多元融合型'

  // 4. 批命
  const seed = members
    .map(m => m.username)
    .sort()
    .join('')
    .split('')
    .reduce((s, c) => s + c.charCodeAt(0), 0)
  const rng      = seededRandom(seed % 233280)
  const tplIndex = Math.floor(rng() * TEAM_PIMING_TEMPLATES.length)
  const verdict  = avgCompat >= 75 ? '战斗力强劲' : avgCompat >= 55 ? '中规中矩' : '需要磨合'

  const teamPiming = TEAM_PIMING_TEMPLATES[tplIndex]
    .replaceAll('{count}',          String(members.length))
    .replaceAll('{dominantElement}', dominantElement)
    .replaceAll('{teamType}',       teamType)
    .replaceAll('{strongA}',        strongestPair[0])
    .replaceAll('{strongB}',        strongestPair[1])
    .replaceAll('{weakA}',          weakestPair[0])
    .replaceAll('{weakB}',          weakestPair[1])
    .replaceAll('{avgCompat}',      String(avgCompat))
    .replaceAll('{verdict}',        verdict)

  return {
    members,
    elementDist,
    dominantElement,
    teamType,
    compatMatrix,
    avgCompat,
    weakestPair,
    strongestPair,
    teamPiming,
  }
}

// 获取两人相性分数（从矩阵中查找，顺序不敏感）
export function getPairCompat(
  matrix: TeamCompatMatrix,
  nameA: string,
  nameB: string
): number {
  return matrix[`${nameA}-${nameB}`]
    ?? matrix[`${nameB}-${nameA}`]
    ?? 0
}
