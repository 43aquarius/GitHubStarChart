export interface DayData {
  date: string
  count: number
  weekday: number
}

export interface RepoData {
  id: number
  name: string
  language: string | null
  stargazers_count: number
  pushed_at: string
  size: number
  fork: boolean
}

export interface GitHubData {
  username: string
  contributions: DayData[]
  repos: RepoData[]
  pullRequestCount: number
  issueCount: number
  topLanguage: string
  lateNightRatio: number
  totalCommits: number
  accountCreatedYear: number
  createdAt?: string
  avatarUrl?: string // 新增：头像URL
}

export interface XiuData {
  id: number
  name: string
  element: string
  animal: string
  palace: string
  direction: string
  trait: string
  desc: string
  angle: number
}

export interface StarPoint {
  angle: number       // 0-360度
  radius: number      // 0-1归一化
  brightness: number  // 0-1
  date: string
  count: number
  health?: number
}

export interface MeteorPoint {
  angle: number
  length: number
}

export interface CometPoint {
  angle: number
  radius: number
}

export interface RepoStar {
  repo: RepoData
  xiu: XiuData
  isMainStar: boolean
}

export interface UserStats {
  totalCommits: number
  lateNightRatio: number
  longestStreak: number
  darkDays: number
  topLanguage: string
  mostActiveDay: string
  mostActiveHour: number
  accountAgeYears?: number
}

// ===== 养成系统接口 =====

export interface Achievement {
  id: string
  name: string
  icon: string
  condition: string
  unlocked: boolean
  desc: string
}

export interface GuardianSpirit {
  name: string
  title: string
  element: string
  desc: string
  ability: string
}

export interface MajorCycle {
  year: number
  name: string
  desc: string
}

export interface CheckinData {
  lastDate: string
  streak: number
  starPower: number
  totalCheckins: number
}

export interface MingPan {
  username: string
  avatarUrl?: string       // 新增：头像URL
  benMingXiu: XiuData
  repos: RepoStar[]
  stars: StarPoint[]
  liuXing: MeteorPoint[]
  huiXing: CometPoint[]
  piming: string
  userType: string
  stats: UserStats
  // --- 养成系统字段 ---
  starHealth: number       // 0-1 全局星光健康度
  achievements: Achievement[]
  guardian: GuardianSpirit
  dayun: MajorCycle[]
}

// ===== 渲染器接口 =====
export type RendererType = 'canvas' | 'svg' | 'text'

export interface MingPanRenderer {
  name: string
  isSupported: () => boolean
  render: (mingpan: MingPan) => React.ReactElement
  exportImage?: (username: string, mode?: 'long' | 'wallpaper') => Promise<void>
}

// ===== 团队星图接口 =====

export interface TeamMember {
  username: string
  mingpan: MingPan
}

export interface TeamElementDist {
  element: string
  count: number
  ratio: number
}

export interface TeamCompatMatrix {
  // key: "usernameA-usernameB"，value: 相性得分 0-100
  [pair: string]: number
}

export interface TeamMingPan {
  members: TeamMember[]
  elementDist: TeamElementDist[]   // 五行分布
  dominantElement: string          // 主导五行
  teamType: string                 // "创造型团队" / "稳健型团队" 等
  compatMatrix: TeamCompatMatrix   // 两两相性矩阵
  avgCompat: number                // 平均相性
  weakestPair: [string, string]    // 最低相性的两人
  strongestPair: [string, string]  // 最高相性的两人
  teamPiming: string               // 团队批命
}
