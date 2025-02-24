// @ts-ignore
import { TextField } from '@equinor/eds-core-react'
import { type ReactElement, useEffect, useState } from 'react'

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
  setPill: (pill: Pill) => void
  setInvalidInput: (value: boolean) => void
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
    let newValue = 0
    if (value !== '') newValue = Number.parseInt(value)

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
    <div style={{ maxWidth: '150px', margin: '10px 0' }}>
      <TextField
        style={{ marginBottom: '16px' }}
        type="number"
        helperText={invalidVolume ? 'Must be a positive number' : undefined}
        label="Pill volume"
        id="pillvolume"
        value={pill.volume.toString()}
        meta="m3"
        variant={(invalidVolume && 'error') || undefined}
        onChange={(event: any) => handleChange(PillInputType.VOLUME, event.target.value)}
        disabled={isLoading}
      />
      <TextField
        style={{ marginBottom: '16px' }}
        type="number"
        label="Pill concentration"
        helperText={invalidDensity ? 'Must be a positive number' : undefined}
        id="pillconcentration"
        value={pill.density.toString()}
        variant={(invalidDensity && 'error') || undefined}
        meta="kg/m3"
        onChange={(event: any) => handleChange(PillInputType.DENSITY, event.target.value)}
        disabled={isLoading}
      />
    </div>
  )
}

export default PillInput
