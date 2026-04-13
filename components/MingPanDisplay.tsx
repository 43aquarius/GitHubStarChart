'use client'
import { useRef, useState, useEffect } from 'react'
import type { MingPan } from '@/lib/types'
import { isCanvasSupported } from '@/lib/utils'
import { CanvasRenderer, type CanvasHandle } from './renderers/CanvasRenderer'
import { SvgRenderer } from './renderers/SvgRenderer'
import { TextRenderer } from './renderers/TextRenderer'
import { exportFromCanvas, generateShareText } from '@/lib/export'
import { AchievementBadge } from './AchievementBadge'
import { YearWheel } from './YearWheel'

type Mode = 'canvas' | 'svg' | 'text'

interface Props {
  mingpan: MingPan
  onCopy?: () => void
  hideExport?: boolean
}

export function MingPanDisplay({ mingpan, onCopy, hideExport = false }: Props) {
  const [mode, setMode] = useState<Mode>('canvas')
  const [copied, setCopied] = useState(false)
  const [showYearWheel, setShowYearWheel] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const canvasRef = useRef<CanvasHandle>(null)

  useEffect(() => {
    if (!isCanvasSupported()) setMode('svg')
  }, [])

  const handleExport = async (exportMode: 'square' = 'square') => {
    if (mode === 'canvas') {
      const canvas = canvasRef.current?.getCanvas()
      if (canvas) await exportFromCanvas(canvas, mingpan.username, exportMode)
    } else {
      await navigator.clipboard.writeText(generateShareText(mingpan))
      alert('图片导出仅支持Canvas模式，已复制文案到剪贴板')
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateShareText(mingpan))
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* 渲染器切换 */}
      <div className="flex justify-center gap-2">
        {(['canvas', 'svg', 'text'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 text-[10px] rounded border transition-all ${
              mode === m
                ? 'border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c10]'
                : 'border-[#c9a84c40] text-[#c9a84c80] hover:border-[#c9a84c60]'
            }`}
          >
            {m === 'canvas' ? '🎨 星图' : m === 'svg' ? '📐 矢量' : '📝 文字'}
          </button>
        ))}
      </div>

      {/* 核心渲染区域 */}
      <div className="relative group">
        {mode === 'canvas' && <CanvasRenderer ref={canvasRef} mingpan={mingpan} />}
        {mode === 'svg'    && <SvgRenderer mingpan={mingpan} />}
        {mode === 'text'   && <TextRenderer mingpan={mingpan} />}
        
        {/* 健康度指示器 */}
        <div className="absolute top-4 right-4 text-right">
          <div className="text-[10px] text-[#c9a84c60] mb-1">星光健康</div>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-16 h-1 bg-[#c9a84c10] rounded-full overflow-hidden">
              <div className="h-full bg-[#f0d080] shadow-[0_0_8px_#f0d080]"
                   style={{ width: `${mingpan.starHealth * 100}%` }} />
            </div>
            <span className="text-xs font-mono text-[#f0d080]">
              {Math.round(mingpan.starHealth * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 成就面板 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#c9a84c90] text-center tracking-widest">
          ── 轨迹成就 ──
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mingpan.achievements.map(ach => (
            <AchievementBadge key={ach.id} achievement={ach} />
          ))}
        </div>
      </div>

      {/* 年轮星图切换 */}
      <div className="text-center">
        <button
          onClick={() => setShowYearWheel(!showYearWheel)}
          className="text-xs text-[#c9a84c90] hover:text-[#c9a84c] underline underline-offset-4"
        >
          {showYearWheel ? '隐藏年轮星图' : '查看多载年轮星图'}
        </button>
        {showYearWheel && (
          <div className="mt-6 animate-in zoom-in duration-300">
            <YearWheel stars={mingpan.stars} />
          </div>
        )}
      </div>

      {/* 守护灵 */}
      <div className="border border-[#c9a84c30] rounded-lg p-6 bg-[#0a0a18] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c9a84c05] to-transparent" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="text-4xl">
            {mingpan.guardian.name.includes('龙') ? '🐉' : 
             mingpan.guardian.name.includes('虎') ? '🐅' : 
             mingpan.guardian.name.includes('雀') ? '🐦' : 
             mingpan.guardian.name.includes('武') ? '🐢' : '🦄'}
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#c9a84c90] mb-1">{mingpan.guardian.title}</div>
            <div className="text-lg font-bold text-[#f0d080]">{mingpan.guardian.name}</div>
            <div className="text-xs text-[#c9a84ca0] mt-1">{mingpan.guardian.desc}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#c9a84c60] mb-1">天赋能力</div>
            <div className="text-xs text-[#f0d080] font-bold">{mingpan.guardian.ability}</div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      {!hideExport && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 justify-center flex-wrap">
            <div className="relative">
              <button 
                onClick={() => setExportOpen(!exportOpen)}
                className="px-6 py-3 border border-[#c9a84c] rounded
                               hover:bg-[#c9a84c20] transition-all text-sm">
                📜 导出命盘
              </button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 min-w-[120px] pb-2">
                    <div className="bg-[#1a1a3e] border border-[#c9a84c40] rounded overflow-hidden shadow-xl">
                      <button onClick={() => { handleExport('square'); setExportOpen(false) }} className="w-full px-4 py-2 text-xs hover:bg-[#c9a84c20] text-left">方图</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button onClick={handleCopy}
                    className="px-6 py-3 border border-[#c9a84c40] rounded
                               hover:bg-[#c9a84c10] transition-all text-sm">
              {copied ? '✓ 已复制' : '🔗 复制文案'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
