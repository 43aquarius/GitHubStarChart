export type OverallStatus = 'thriving' | 'dim' | 'cracked' | 'fallen'

interface BadgeData {
  xiuName: string
  palace: string
  topLanguage: string
  overallStatus: OverallStatus
  longestStreak: number
}

const STATUS_COLOR: Record<OverallStatus, string> = {
  thriving: '#4a9e6b',
  dim: '#c9a84c',
  cracked: '#e07b39',
  fallen: '#9e4a4a',
}

const STATUS_LABEL: Record<OverallStatus, string> = {
  thriving: '星力旺盛',
  dim: '星力渐暗',
  cracked: '星力有裂',
  fallen: '星力陨落',
}

export function generateBadgeSvg(data: BadgeData): string {
  const { xiuName, topLanguage, overallStatus, longestStreak } = data
  const statusColor = STATUS_COLOR[overallStatus]
  const statusLabel = STATUS_LABEL[overallStatus]

  const leftText = `✦ ${xiuName}`
  const rightText = `${topLanguage} · ${longestStreak}日 · ${statusLabel}`

  function estimateWidth(text: string): number {
    let w = 0
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i)
      w += code > 127 ? 11 : 7
    }
    return w + 16
  }

  const leftW = estimateWidth(leftText)
  const rightW = estimateWidth(rightText)
  const totalW = leftW + rightW

  const dotX = leftW + 8
  const dotY = 10
  const dotR = 4

  return `<svg xmlns="http://www.w3.org/2000/svg"
  width="${totalW}" height="20"
  role="img" aria-label="GitHub 命盘: ${escapeXml(xiuName)}">
  <title>GitHub 命盘: ${escapeXml(xiuName)}</title>
  <defs>
    <linearGradient id="s" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${totalW}" height="20" rx="3" fill="#fff"/>
    </clipPath>
  </defs>
  <g clip-path="url(#r)">
    <rect width="${leftW}" height="20" fill="#1a1a3e"/>
    <rect x="${leftW}" width="${rightW}" height="20" fill="${statusColor}"/>
    <rect width="${totalW}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle"
     font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${leftW / 2}" y="15" fill="#000" fill-opacity=".3"
          textLength="${leftW - 10}" lengthAdjust="spacing">${escapeXml(leftText)}</text>
    <text x="${leftW / 2}" y="14"
          textLength="${leftW - 10}" lengthAdjust="spacing">${escapeXml(leftText)}</text>
    <text x="${leftW + rightW / 2}" y="15" fill="#000" fill-opacity=".3"
          textLength="${rightW - 10}" lengthAdjust="spacing">${escapeXml(rightText)}</text>
    <text x="${leftW + rightW / 2}" y="14"
          textLength="${rightW - 10}" lengthAdjust="spacing">${escapeXml(rightText)}</text>
  </g>
  <circle cx="${dotX}" cy="${dotY}" r="${dotR}"
          fill="${statusColor}" stroke="#fff" stroke-width="1"
          opacity="0.9"/>
</svg>`
}

export function generateErrorBadgeSvg(message: string): string {
  const text = `✦ 命盘 · ${message}`
  const width = Math.max(160, text.length * 8)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img">
  <rect width="${width}" height="20" rx="3" fill="#555"/>
  <text x="${width / 2}" y="14" fill="#fff"
        font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11"
        text-anchor="middle">${escapeXml(text)}</text>
</svg>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

