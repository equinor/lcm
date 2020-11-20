import React, { ReactElement, useEffect, useState } from 'react'
// @ts-ignore
import { TextField } from '@equinor/eds-core-react'

enum PillInputType {
  VOLUME = 'volume',
  DENSITY = 'density',
}

export interface Pill {
  volume: number
  density: number
  mass: number
}

interface PillInputProps {
  isLoading: boolean
  pill: Pill
  setPill: Function
  setInvalidInput: Function
}

const PillInput = ({ pill, setPill, isLoading, setInvalidInput }: PillInputProps): ReactElement => {
  const [invalidVolume, setInvalidVolume] = useState<boolean>(false)
  const [invalidDensity, setInvalidDensity] = useState<boolean>(false)

  useEffect(() => {
    if (invalidDensity || invalidVolume) {
      setInvalidInput(true)
    } else setInvalidInput(false)
  }, [invalidDensity, invalidVolume])

  const handleChange = (type: string, value: string) => {
    let newValue: number = 0
    if (value !== '') newValue = parseInt(value)

    if (Math.sign(newValue) <= 0) {
      type === PillInputType.VOLUME && setInvalidVolume(true)
      type === PillInputType.DENSITY && setInvalidDensity(true)
    } else {
      type === PillInputType.VOLUME && setInvalidVolume(false)
      type === PillInputType.DENSITY && setInvalidDensity(false)
    }

    if (type === PillInputType.VOLUME) {
      setPill({
        volume: newValue,
        mass: newValue * pill.density,
        density: pill.density,
      })
    }
    if (type === PillInputType.DENSITY) {
      setPill({
        volume: pill.volume,
        mass: newValue * pill.volume,
        density: newValue,
      })
    }
  }

  return (
    <div style={{ maxWidth: '150px' }}>
      <TextField
        style={{ marginBottom: '16px' }}
        type='number'
        helperText={invalidVolume ? 'Must be a positive number' : undefined}
        label='Pill volume'
        id='pillvolume'
        value={pill.volume}
        meta='m3'
        variant={(invalidVolume && 'error') || undefined}
        onChange={(event: any) => handleChange(PillInputType.VOLUME, event.target.value)}
        disabled={isLoading}
      />
      <TextField
        style={{ marginBottom: '16px' }}
        type='number'
        label='Pill density'
        helperText={invalidDensity ? 'Must be a positive number' : undefined}
        id='pilldensity'
        value={pill.density}
        variant={(invalidDensity && 'error') || undefined}
        meta='kg/m3'
        onChange={(event: any) => handleChange(PillInputType.DENSITY, event.target.value)}
        disabled={isLoading}
      />
    </div>
  )
}

export default PillInput
