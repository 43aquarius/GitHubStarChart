import type { GitHubData, RepoData, DayData } from './types'

const GITHUB_API = 'https://api.github.com'

async function fetchContributions(username: string): Promise<DayData[]> {
  const res = await fetch(`/api/contributions?username=${encodeURIComponent(username)}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? '获取贡献数据失败')
  return data
}

async function fetchRepos(username: string): Promise<RepoData[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/repos?sort=pushed&per_page=100&type=owner`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  )
  if (res.status === 403) {
    const reset = res.headers.get('X-RateLimit-Reset')
    const resetTime = reset
      ? new Date(parseInt(reset) * 1000).toLocaleTimeString('zh-CN')
      : '稍后'
    throw new Error(`GitHub API限流，请于 ${resetTime} 后重试`)
  }
  if (res.status === 404) throw new Error('用户不存在')
  if (!res.ok) throw new Error(`获取仓库失败 (${res.status})`)

  const repos = await res.json()
  if (!Array.isArray(repos)) throw new Error('仓库数据格式异常')
  return repos.filter((r: any) => !r.fork).slice(0, 28)
}

async function fetchUserBasic(username: string) {
  const res = await fetch(`${GITHUB_API}/users/${username}`)
  if (!res.ok) return { created_at: new Date().toISOString(), avatar_url: '' }
  return await res.json()
}

async function fetchEvents(username: string) {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/events/public?per_page=100`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    )
    if (!res.ok) return { pushes: [], pullRequests: [], issues: [] }
    const events = await res.json()
    if (!Array.isArray(events)) return { pushes: [], pullRequests: [], issues: [] }
    return {
      pushes:       events.filter((e: any) => e.type === 'PushEvent'),
      pullRequests: events.filter((e: any) => e.type === 'PullRequestEvent'),
      issues:       events.filter((e: any) => e.type === 'IssuesEvent'),
    }
  } catch {
    return { pushes: [], pullRequests: [], issues: [] }
  }
}

export async function fetchAllData(username: string): Promise<GitHubData> {
  const [contributions, repos, events, basic] = await Promise.all([
    fetchContributions(username),
    fetchRepos(username),
    fetchEvents(username),
    fetchUserBasic(username),
  ])

  const totalPushes = events.pushes.length
  const lateNightPushes = events.pushes.filter((e: any) => {
    const h = new Date(e.created_at).getHours()
    return h >= 22 || h <= 4
  }).length
  const lateNightRatio = totalPushes > 0 ? lateNightPushes / totalPushes : 0

  const langCount: Record<string, number> = {}
  repos.forEach(r => {
    if (r.language) langCount[r.language] = (langCount[r.language] ?? 0) + 1
  })
  const topLanguage =
    Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '虚空'

  const safeRepos: RepoData[] = repos.length > 0 ? repos : [{
    id: 0, name: username, language: null,
    stargazers_count: 0, pushed_at: new Date().toISOString(),
    size: 0, fork: false,
  }]

  const createdAt = typeof basic?.created_at === 'string'
    ? basic.created_at
    : new Date().toISOString()
  const accountCreatedYear = new Date(createdAt).getFullYear()

  return {
    username,
    contributions,
    repos: safeRepos,
    pullRequestCount: events.pullRequests.length,
    issueCount: events.issues.length,
    topLanguage,
    lateNightRatio,
    totalCommits: contributions.reduce((s, d) => s + d.count, 0),
    accountCreatedYear,
    createdAt,
    avatarUrl: basic?.avatar_url ?? '',
  }
}
