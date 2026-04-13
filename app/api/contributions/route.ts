import { NextRequest } from 'next/server'
import type { DayData } from '@/lib/types'

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')
  if (!username) {
    return Response.json({ error: '缺少username参数' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      { next: { revalidate: 3600 } }
    )
    if (res.status === 404) {
      return Response.json({ error: `用户 "${username}" 不存在` }, { status: 404 })
    }
    if (!res.ok) throw new Error(`上游API返回 ${res.status}`)

    const data = await res.json()
    if (!data.contributions || !Array.isArray(data.contributions)) {
      throw new Error('数据格式异常')
    }

    const days: DayData[] = data.contributions.map((d: any) => ({
      date: d.date,
      count: d.count ?? 0,
      weekday: new Date(d.date).getDay(),
    }))
    return Response.json(days)

  } catch {
    // 降级：解析GitHub SVG
    try {
      const svgRes = await fetch(
        `https://github.com/users/${username}/contributions`,
        { headers: { 'Accept': 'text/html' } }
      )
      const html = await svgRes.text()
      const days = parseGitHubHTML(html)
      if (days.length === 0) throw new Error('解析结果为空')
      return Response.json(days)
    } catch {
      return Response.json(
        { error: '获取贡献数据失败，请稍后重试' },
        { status: 500 }
      )
    }
  }
}

function parseGitHubHTML(html: string): DayData[] {
  const days: DayData[] = []

  // 新版GitHub：data-level（0-4）
  const newRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"/g
  // 旧版GitHub：data-count
  const oldRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-count="(\d+)"/g

  let match
  while ((match = newRegex.exec(html)) !== null) {
    const level = parseInt(match[2], 10)
    days.push({
      date: match[1],
      count: [0, 1, 3, 6, 10][level] ?? 0,
      weekday: new Date(match[1]).getDay(),
    })
  }

  if (days.length === 0) {
    while ((match = oldRegex.exec(html)) !== null) {
      days.push({
        date: match[1],
        count: parseInt(match[2], 10),
        weekday: new Date(match[1]).getDay(),
      })
    }
  }

  return days
}
