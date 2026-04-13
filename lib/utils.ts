export function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function usernameToSeed(username: string): number {
  return username
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const chars = text.split('')
  let line = ''
  let currentY = y

  chars.forEach(char => {
    const testLine = line + char
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY)
      line = char
      currentY += lineHeight
    } else {
      line = testLine
    }
  })
  if (line) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }
  return currentY
}

// 检测Canvas是否可用
export function isCanvasSupported(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext && canvas.getContext('2d'))
  } catch {
    return false
  }
}
