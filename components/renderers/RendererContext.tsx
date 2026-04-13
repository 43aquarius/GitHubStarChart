'use client'
import { createContext, useContext } from 'react'

export type RendererType = 'canvas' | 'svg' | 'text'

interface RendererCtx {
  type: RendererType
}

const RendererContext = createContext<RendererCtx>({ type: 'canvas' })

export function useRendererType() {
  return useContext(RendererContext).type
}

export function RendererProvider({
  type,
  children,
}: {
  type: RendererType
  children: React.ReactNode
}) {
  return (
    <RendererContext.Provider value={{ type }}>
      {children}
    </RendererContext.Provider>
  )
}
