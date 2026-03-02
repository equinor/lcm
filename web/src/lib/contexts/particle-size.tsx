import { createContext, useContext, useState } from 'react'

type ParticleSizeContextType = {
  from: number
  to: number
  range: [number, number]
  setFrom: (from: number) => void
  setTo: (to: number) => void
  setRange: (range: [number, number]) => void
}

export const ParticleSizeContext = createContext<ParticleSizeContextType | undefined>(undefined)

export function ParticleSizeContextProvider({ children }: { children: React.ReactNode }) {
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(1000)

  const range = [from, to] as [number, number]
  function setRange(range: [number, number]) {
    setFrom(range[0])
    setTo(range[1])
  }

  return (
    <ParticleSizeContext.Provider
      value={{
        from,
        to,
        range,
        setFrom,
        setTo,
        setRange,
      }}
    >
      {children}
    </ParticleSizeContext.Provider>
  )
}

export function useParticleSizeContext(): ParticleSizeContextType {
  const context = useContext(ParticleSizeContext)
  if (!context) {
    throw new Error('useParticleSizeContext must be used within a ParticleSizeContextProvider')
  }
  return context
}
