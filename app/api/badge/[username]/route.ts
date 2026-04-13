import { NextRequest } from 'next/server'
import { fetchAllData } from '@/lib/github'
import { calculateMingPan } from '@/lib/mingpan'
import { generateBadgeSvg, generateErrorBadgeSvg } from '@/lib/badge'

// 允许所有来源访问（徽章需要跨域）
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'image/svg+xml',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params

  if (!username || username.length > 39) {
    return new Response(
      generateErrorBadgeSvg('用户名无效'),
      { headers: CORS_HEADERS }
    )
  }

  try {
    const data    = await fetchAllData(username)
    const mingpan = calculateMingPan(data)

    // Calculate overallStatus based on recent activity
    const now = Date.now()
    const lastCommitDate = data.contributions
      .filter(d => d.count > 0)
      .map(d => new Date(d.date).getTime())
      .sort((a, b) => b - a)[0]

    const daysSinceLastCommit = lastCommitDate ? (now - lastCommitDate) / (1000 * 60 * 60 * 24) : Infinity
    let overallStatus: 'thriving' | 'dim' | 'cracked' | 'fallen' = 'fallen'
    if (daysSinceLastCommit <= 7) overallStatus = 'thriving'
    else if (daysSinceLastCommit <= 14) overallStatus = 'dim'
    else if (daysSinceLastCommit <= 30) overallStatus = 'cracked'

    const svg = generateBadgeSvg({
      xiuName:       mingpan.benMingXiu.name,
      palace:        mingpan.benMingXiu.palace,
      topLanguage:   mingpan.stats.topLanguage,
      overallStatus: overallStatus,
      longestStreak: mingpan.stats.longestStreak,
    })

    return new Response(svg, { headers: CORS_HEADERS })

  } catch (e) {
    const msg = e instanceof Error ? e.message : '获取失败'
    return new Response(
      generateErrorBadgeSvg(msg.slice(0, 12)),
      { status: 200, headers: CORS_HEADERS }  // 徽章始终返回200，否则GitHub不显示
    )
  }
}
