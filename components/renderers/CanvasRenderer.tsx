'use client'
import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import type { MingPan } from '@/lib/types'
import { XIU_DATA } from '@/lib/data/xiu'
import { seededRandom, wrapText } from '@/lib/utils'

export interface CanvasHandle {
  getCanvas: () => HTMLCanvasElement | null
}

const PIMING_AREA_HEIGHT = 140

const C = {
  gold:      '#d4af37', // 稍微加深饱和度
  goldLight: '#ffec8b', // 更亮的金色
  goldDim:   '#d4af3740',
  meteor:    '#ffd700',
  comet:     '#87ceeb',
  health: {
    good:    '#ffec8b',
    dim:     '#d4af3760',
    bad:     '#4a4a4a',
  },
  palaces: {
    '东方青龙': '#4a9e6b',
    '北方玄武': '#4a6b9e',
    '西方白虎': '#9e9e9e',
    '南方朱雀': '#9e4a4a',
  } as Record<string, string>,
}

export const CanvasRenderer = forwardRef<CanvasHandle, { mingpan: MingPan }>(
  ({ mingpan }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null)

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }))

    // 预加载头像
    useEffect(() => {
      if (mingpan.avatarUrl) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = mingpan.avatarUrl
        img.onload = () => setAvatarImg(img)
        img.onerror = () => setAvatarImg(null)
      } else {
        setAvatarImg(null)
      }
    }, [mingpan.avatarUrl])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const containerWidth = canvas.parentElement?.clientWidth ?? 600
      const SIZE = Math.min(800, containerWidth - 32)
      const TOTAL_H = SIZE + PIMING_AREA_HEIGHT
      const DPR = window.devicePixelRatio || 1

      canvas.width  = SIZE * DPR
      canvas.height = TOTAL_H * DPR
      canvas.style.width  = `${SIZE}px`
      canvas.style.height = `${TOTAL_H}px`
      ctx.scale(DPR, DPR)

      const CX = SIZE / 2
      const CY = SIZE / 2
      const R  = SIZE * 0.40

      draw(ctx, CX, CY, R, SIZE, TOTAL_H, mingpan, avatarImg)
    }, [mingpan, avatarImg])

    return (
      <canvas
        ref={canvasRef}
        className="mx-auto block"
        style={{ boxShadow: '0 0 60px rgba(212,175,55,0.2)', maxWidth: '100%' }}
      />
    )
  }
)
CanvasRenderer.displayName = 'CanvasRenderer'

function draw(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  size: number, totalH: number,
  mingpan: MingPan,
  avatarImg: HTMLImageElement | null
) {
  ctx.clearRect(0, 0, size, totalH)
  drawStarfield(ctx, cx, cy, r)
  drawPalaceAreas(ctx, cx, cy, r)
  drawRings(ctx, cx, cy, r, mingpan.starHealth)
  drawXiuDividers(ctx, cx, cy, r)
  drawXiuLabels(ctx, cx, cy, r, mingpan)
  drawCommitStars(ctx, cx, cy, r, mingpan)
  drawConstellationLines(ctx, cx, cy, r, mingpan)
  drawMeteors(ctx, cx, cy, r, mingpan)
  drawComets(ctx, cx, cy, r, mingpan)
  drawCenterCircle(ctx, cx, cy, r, mingpan, avatarImg)
  drawOuterDecorations(ctx, cx, cy, r)
  drawPimingText(ctx, cx, cy, r, mingpan)
}

function drawStarfield(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip()
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  bg.addColorStop(0, '#1a1a3e'); bg.addColorStop(0.7, '#0d0d25'); bg.addColorStop(1, '#050510')
  ctx.fillStyle = bg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  const rng = seededRandom(42)
  for (let i = 0; i < 300; i++) {
    const a = rng() * Math.PI * 2, d = rng() * r
    ctx.fillStyle = `rgba(255,255,255,${rng() * 0.2 + 0.03})`
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rng() * 1.2, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

function drawPalaceAreas(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const areas = [
    { palace: '东方青龙', start: -Math.PI / 2, end: 0 },
    { palace: '北方玄武', start: 0,            end: Math.PI / 2 },
    { palace: '西方白虎', start: Math.PI / 2,  end: Math.PI },
    { palace: '南方朱雀', start: Math.PI,       end: Math.PI * 1.5 },
  ] as const
  areas.forEach(({ palace, start, end }) => {
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, end); ctx.closePath()
    ctx.fillStyle = C.palaces[palace] + '18'; ctx.fill()
  })
}

function drawRings(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, health: number) {
  [
    { ratio: 0.18, w: 1.5 },
    { ratio: 0.50, w: 0.8 },
    { ratio: 0.75, w: 0.5 },
    { ratio: 0.88, w: 0.8 },
    { ratio: 1.00, w: 2.0 },
  ].forEach(({ ratio, w }) => {
    ctx.beginPath(); ctx.arc(cx, cy, r * ratio, 0, Math.PI * 2)
    ctx.strokeStyle = health > 0.5 ? C.gold + '80' : C.goldDim
    ctx.lineWidth = w; ctx.stroke()
  })
}

function drawXiuDividers(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const step = (Math.PI * 2) / 28
  for (let i = 0; i < 28; i++) {
    const a = -Math.PI / 2 + i * step
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * 0.50, cy + Math.sin(a) * r * 0.50)
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    ctx.strokeStyle = C.goldDim; ctx.lineWidth = 0.5; ctx.stroke()
  }
}

function drawXiuLabels(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mingpan: MingPan) {
  const step = (Math.PI * 2) / 28
  const fontSize = Math.max(10, Math.min(13, r * 0.033))
  const lineH = fontSize * 1.3
  
  ctx.save()
  ctx.shadowBlur = 2
  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  
  XIU_DATA.forEach((xiu, i) => {
    const isMain  = xiu.id === mingpan.benMingXiu.id
    const midAngle = -Math.PI / 2 + i * step + step / 2
    const x = cx + Math.cos(midAngle) * r * 0.935, y = cy + Math.sin(midAngle) * r * 0.935
    ctx.save(); ctx.translate(x, y); ctx.rotate(midAngle + Math.PI / 2)
    ctx.font = `${isMain ? 'bold ' : ''}${fontSize}px serif`
    ctx.fillStyle = isMain ? C.goldLight : C.gold + 'cc'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    xiu.name.split('').forEach((char, j) => { ctx.fillText(char, 0, (j - 1) * lineH) })
    ctx.restore()
  })
  ctx.restore()
}

function drawCommitStars(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mingpan: MingPan) {
  const outerR = r * 0.75, innerR = r * 0.20
  mingpan.stars.forEach(star => {
    const rad  = (star.angle / 360) * Math.PI * 2 - Math.PI / 2
    const dist = innerR + (outerR - innerR) * star.radius
    const x = cx + Math.cos(rad) * dist, y = cy + Math.sin(rad) * dist
    const health = star.health ?? 1
    if (star.brightness > 0.4) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 8)
      glow.addColorStop(0, `rgba(255,248,220,${star.brightness * 0.35 * health})`)
      glow.addColorStop(1, 'rgba(255,248,220,0)')
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill()
    }
    ctx.beginPath(); ctx.arc(x, y, 1 + star.brightness * 2.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,248,220,${(0.6 + star.brightness * 0.4) * health})`
    ctx.fill()
  })
}

function drawConstellationLines(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mingpan: MingPan) {
  const outerR = r * 0.75, innerR = r * 0.20
  const groups = Array.from({ length: 28 }, (): typeof mingpan.stars => [])
  mingpan.stars.forEach(s => { groups[Math.floor(s.angle / (360 / 28)) % 28].push(s) })
  ctx.strokeStyle = C.gold + (mingpan.starHealth > 0.5 ? '40' : '15')
  ctx.lineWidth = 0.8
  groups.forEach(g => {
    if (g.length < 2) return
    ctx.beginPath()
    g.sort((a, b) => a.radius - b.radius).forEach((s, i) => {
      const rad = (s.angle / 360) * Math.PI * 2 - Math.PI / 2
      const dist = innerR + (outerR - innerR) * s.radius
      i === 0 ? ctx.moveTo(cx + Math.cos(rad) * dist, cy + Math.sin(rad) * dist) : ctx.lineTo(cx + Math.cos(rad) * dist, cy + Math.sin(rad) * dist)
    })
    ctx.stroke()
  })
}

function drawMeteors(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mingpan: MingPan) {
  mingpan.liuXing.forEach(m => {
    const rad = (m.angle / 360) * Math.PI * 2 - Math.PI / 2
    const sd = r * 0.55
    const x1 = cx + Math.cos(rad) * sd, y1 = cy + Math.sin(rad) * sd
    const x2 = cx + Math.cos(rad) * (sd + m.length), y2 = cy + Math.sin(rad) * (sd + m.length)
    const g = ctx.createLinearGradient(x1, y1, x2, y2)
    g.addColorStop(0, '#ffd700cc'); g.addColorStop(0.4, '#ffd70060'); g.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(x1, y1, 2, 0, Math.PI * 2); ctx.fillStyle = C.meteor; ctx.fill()
  })
}

function drawComets(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mingpan: MingPan) {
  mingpan.huiXing.forEach(c => {
    const rad = (c.angle / 360) * Math.PI * 2 - Math.PI / 2
    const dist = r * c.radius
    const x = cx + Math.cos(rad) * dist, y = cy + Math.sin(rad) * dist
    const ta = rad + Math.PI, tx = x + Math.cos(ta) * 35, ty = y + Math.sin(ta) * 35
    const tg = ctx.createLinearGradient(x, y, tx, ty)
    tg.addColorStop(0, '#87ceeb80'); tg.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.strokeStyle = tg; ctx.lineWidth = 2; ctx.stroke()
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = '#87ceebc0'; ctx.fill()
  })
}

function drawCenterCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  mingpan: MingPan,
  avatarImg: HTMLImageElement | null
) {
  const R = r * 0.18
  
  // 绘制中心背景
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
  grad.addColorStop(0, '#2a1a08'); grad.addColorStop(1, '#0a0510')
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill()
  
  // 绘制头像或文字
  if (avatarImg) {
    ctx.save()
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.85, 0, Math.PI * 2); ctx.clip()
    ctx.drawImage(avatarImg, cx - R * 0.85, cy - R * 0.85, R * 1.7, R * 1.7)
    ctx.restore()
  } else {
    const { name } = mingpan.benMingXiu
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.font = `bold ${Math.max(14, R * 0.35)}px serif`
    ctx.fillStyle = mingpan.starHealth > 0.5 ? C.goldLight : C.goldDim
    name.split('').forEach((ch, i) => { ctx.fillText(ch, cx, cy - R * 0.2 + i * R * 0.4) })
  }

  // 中心圆外圈边框
  ctx.strokeStyle = mingpan.starHealth > 0.5 ? C.goldLight : C.health.bad
  ctx.lineWidth = 2; ctx.stroke()
  
  // 方位宫位
  const { palace } = mingpan.benMingXiu
  ctx.save()
  ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(0,0,0,1)'
  ctx.font = `${Math.max(9, R * 0.18)}px serif`
  ctx.fillStyle = C.goldLight
  ctx.textAlign = 'center'
  ctx.fillText(palace, cx, cy + R * 1.2) // 移到圆盘外一点
  ctx.restore()
}

function drawOuterDecorations(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.shadowBlur = 2; ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.font = 'bold 12px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ;[{ label: '子·北', angle: -Math.PI / 2 }, { label: '午·南', angle:  Math.PI / 2 }, { label: '卯·东', angle:  0 }, { label: '酉·西', angle:  Math.PI }].forEach(({ label, angle }) => {
    ctx.fillStyle = C.goldLight; ctx.fillText(label, cx + Math.cos(angle) * (r + 25), cy + Math.sin(angle) * (r + 25))
  })
  ctx.restore()
  
  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2); ctx.strokeStyle = C.goldDim; ctx.lineWidth = 1; ctx.stroke()
}

function drawPimingText(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mingpan: MingPan) {
  const y = cy + r + 45
  ctx.save()
  ctx.shadowBlur = 3; ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.font = 'bold 14px serif'; ctx.fillStyle = C.goldLight; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  wrapText(ctx, `「${mingpan.piming}」`, cx, y, r * 1.8, 22)
  ctx.restore()
}
