import type { MingPan } from './types'

export async function exportFromCanvas(
  canvasEl: HTMLCanvasElement,
  username: string,
  mode: 'square' = 'square'
): Promise<void> {
  const DPR = window.devicePixelRatio || 1
  const originalW = canvasEl.width / DPR
  const originalH = canvasEl.height / DPR
  
  const targetW = originalW
  const targetH = originalH

  const out = document.createElement('canvas')
  out.width = targetW * DPR
  out.height = targetH * DPR
  const ctx = out.getContext('2d')!
  ctx.scale(DPR, DPR)

  // 背景
  ctx.fillStyle = '#050510'
  ctx.fillRect(0, 0, targetW, targetH)

  // 绘制原命盘
  const offsetX = (targetW - originalW) / 2
  const offsetY = 0
  ctx.drawImage(canvasEl, 0, 0, canvasEl.width, canvasEl.height, offsetX, offsetY, originalW, originalH)

  const link = document.createElement('a')
  link.download = `${username}-命盘-${mode}.png`
  link.href = out.toDataURL('image/png', 1.0)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function generateShareText(mingpan: MingPan): string {
  const { benMingXiu, piming, stats, username } = mingpan
  return [
    '【GitHub 命盘】',
    '',
    `✦ ${username} 的命盘 ✦`,
    `本命星宿：${benMingXiu.name}（${benMingXiu.palace}）`,
    `主力语言：${stats.topLanguage}`,
    `最长连提：${stats.longestStreak} 日`,
    `最活跃日：${stats.mostActiveDay}`,
    `星光健康：${Math.round(mingpan.starHealth * 100)}%`,
    '',
    `「${piming}」`,
    '',
    `#GitHub命盘 #${benMingXiu.name}`,
  ].join('\n')
}
