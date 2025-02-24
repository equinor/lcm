import { createContext } from 'react'

interface ParticleRange {
  from: number
  to: number
  setRange: Function
}

export const ParticleSizeContext = createContext<ParticleRange>({
  from: 1,
  to: 1000,
  setRange: () => {},
})

export interface User {
  token: string
  email: string
  name: string
}
