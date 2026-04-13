// 不依赖Canvas API，所有浏览器都支持
import type { MingPan } from '@/lib/types'
import { XIU_DATA } from '@/lib/data/xiu'

const SIZE  = 600
const CX    = SIZE / 2
const CY    = SIZE / 2
const R     = SIZE * 0.40

const C = {
  gold:      '#d4af37',
  goldLight: '#ffec8b',
}

function polarToXY(angleDeg: number, radius: number) {
  const rad = (angleDeg / 360) * Math.PI * 2 - Math.PI / 2
  return {
    x: CX + Math.cos(rad) * radius,
    y: CY + Math.sin(rad) * radius,
  }
}

export function SvgRenderer({ mingpan }: { mingpan: MingPan }) {
  const step = 360 / 28

  return (
    <svg
      width={SIZE}
      height={SIZE + 120}
      viewBox={`0 0 ${SIZE} ${SIZE + 120}`}
      className="mx-auto block max-w-full"
      style={{ fontFamily: 'serif' }}
    >
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1a1a3e" />
          <stop offset="70%"  stopColor="#0d0d25" />
          <stop offset="100%" stopColor="#050510" />
        </radialGradient>
        <clipPath id="circle-clip">
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
        <clipPath id="avatar-clip">
          <circle cx={CX} cy={CY} r={R * 0.15} />
        </clipPath>
        <filter id="text-glow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
          <feFlood floodColor="black" result="flood" />
          <feComposite in="flood" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 背景 */}
      <circle cx={CX} cy={CY} r={R} fill="url(#bg-grad)" />

      {/* 四宫色块 */}
      {[
        { palace: '东方青龙', color: '#4a9e6b', startDeg: -90, endDeg: 0 },
        { palace: '北方玄武', color: '#4a6b9e', startDeg: 0,   endDeg: 90 },
        { palace: '西方白虎', color: '#9e9e9e', startDeg: 90,  endDeg: 180 },
        { palace: '南方朱雀', color: '#9e4a4a', startDeg: 180, endDeg: 270 },
      ].map(({ palace, color, startDeg, endDeg }) => {
        const s = (startDeg / 360) * Math.PI * 2 - Math.PI / 2
        const e = (endDeg   / 360) * Math.PI * 2 - Math.PI / 2
        const x1 = CX + Math.cos(s) * R, y1 = CY + Math.sin(s) * R
        const x2 = CX + Math.cos(e) * R, y2 = CY + Math.sin(e) * R
        return (
          <path
            key={palace}
            d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`}
            fill={color}
            fillOpacity={0.1}
          />
        )
      })}

      {/* 同心圆 */}
      {[0.18, 0.50, 0.75, 0.88, 1.00].map(ratio => (
        <circle
          key={ratio}
          cx={CX} cy={CY} r={R * ratio}
          fill="none"
          stroke={mingpan.starHealth > 0.5 ? C.gold : '#d4af3730'}
          strokeOpacity={0.6}
          strokeWidth={ratio === 1 ? 2 : 0.8}
        />
      ))}

      {/* 28宿分割线 */}
      {Array.from({ length: 28 }, (_, i) => {
        const a = (-90 + i * step) / 360 * Math.PI * 2
        return (
          <line
            key={i}
            x1={CX + Math.cos(a) * R * 0.5} y1={CY + Math.sin(a) * R * 0.5}
            x2={CX + Math.cos(a) * R}        y2={CY + Math.sin(a) * R}
            stroke={C.gold} strokeOpacity={0.3} strokeWidth={0.5}
          />
        )
      })}

      {/* commit星点 */}
      <g clipPath="url(#circle-clip)">
        {mingpan.stars.map((star, i) => {
          const { x, y } = polarToXY(star.angle, R * 0.20 + R * 0.55 * star.radius)
          const health = star.health ?? 1
          return (
            <circle
              key={i}
              cx={x} cy={y}
              r={1 + star.brightness * 2.5}
              fill={`rgba(255,248,220,${(0.6 + star.brightness * 0.4) * health})`}
            />
          )
        })}
      </g>

      {/* PR流星 */}
      {mingpan.liuXing.map((m, i) => {
        const rad = (m.angle / 360) * Math.PI * 2 - Math.PI / 2
        const sd = R * 0.55
        return (
          <line
            key={i}
            x1={CX + Math.cos(rad) * sd}
            y1={CY + Math.sin(rad) * sd}
            x2={CX + Math.cos(rad) * (sd + m.length)}
            y2={CY + Math.sin(rad) * (sd + m.length)}
            stroke="#ffd700" strokeOpacity={0.6} strokeWidth={1.5}
          />
        )
      })}

      {/* 28宿文字标签 */}
      <g filter="url(#text-glow)">
        {XIU_DATA.map((xiu, i) => {
          const isMain   = xiu.id === mingpan.benMingXiu.id
          const midAngle = -90 + i * step + step / 2
          const rad      = (midAngle / 360) * Math.PI * 2
          const lx = CX + Math.cos(rad) * R * 0.935
          const ly = CY + Math.sin(rad) * R * 0.935

          return (
            <text
              key={xiu.id}
              x={lx} y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isMain ? 13 : 11}
              fontWeight={isMain ? 'bold' : 'normal'}
              fill={isMain ? C.goldLight : C.gold + 'ee'}
              transform={`rotate(${midAngle + 90}, ${lx}, ${ly})`}
            >
              {xiu.name}
            </text>
          )
        })}
      </g>

      {/* 中心命盘 */}
      <circle cx={CX} cy={CY} r={R * 0.18} fill="#1a0d05" fillOpacity={0.9}
              stroke={mingpan.starHealth > 0.5 ? C.goldLight : '#4a4a4a'} strokeWidth={2} />
      
      {mingpan.avatarUrl ? (
        <image
          href={mingpan.avatarUrl}
          x={CX - R * 0.15}
          y={CY - R * 0.15}
          width={R * 0.3}
          height={R * 0.3}
          clipPath="url(#avatar-clip)"
        />
      ) : (
        mingpan.benMingXiu.name.split('').map((ch, i) => (
          <text
            key={i}
            x={CX} y={CY - R * 0.063 + i * R * 0.063}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.max(12, R * 0.05)}
            fontWeight="bold" fill={mingpan.starHealth > 0.5 ? C.goldLight : '#c9a84c40'}
          >
            {ch}
          </text>
        ))
      )}

      {/* 方位标注 */}
      <g filter="url(#text-glow)">
        {[
          { label: '子·北', deg: -90 },
          { label: '午·南', deg: 90 },
          { label: '卯·东', deg: 0 },
          { label: '酉·西', deg: 180 },
        ].map(({ label, deg }) => {
          const rad = (deg / 180) * Math.PI
          return (
            <text key={label}
              x={CX + Math.cos(rad) * (R + 25)}
              y={CY + Math.sin(rad) * (R + 25)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={12} fontWeight="bold" fill={C.goldLight}
            >
              {label}
            </text>
          )
        })}
      </g>

      {/* 批命文案 */}
      <foreignObject x={CX - R} y={CY + R + 35} width={R * 2} height={100}>
        <div style={{
          color: C.goldLight,
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          lineHeight: '1.5'
        }}>
          「{mingpan.piming}」
        </div>
      </foreignObject>
    </svg>
  )
}
