import React, { ReactElement, useState } from 'react'
import styled from 'styled-components'
// @ts-ignore
import { TextField, Button } from '@equinor/eds-core-react'

const Wrapper = styled.div`
  padding: 10px 0 10px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  width: fit-content;
`

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
  handleOptimize: Function
}

const PillInput = ({ pill, setPill, isLoading, handleOptimize }: PillInputProps): ReactElement => {
  const [invalidVolume, setInvalidVolume] = useState<boolean>(false)
  const [invalidDensity, setInvalidDensity] = useState<boolean>(false)

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
    <Wrapper>
      <TextField
        type="number"
        helperText={invalidVolume ? 'Must be a positive number' : undefined}
        label="Enter pill volume"
        id="pillvolume"
        value={pill.volume}
        meta="m3"
        variant={(invalidVolume && 'error') || undefined}
        onChange={(event: any) => handleChange(PillInputType.VOLUME, event.target.value)}
        disabled={isLoading}
      />
      <TextField
        type="number"
        label="Enter pill density"
        helperText={invalidDensity ? 'Must be a positive number' : undefined}
        id="pilldensity"
        value={pill.density}
        variant={(invalidDensity && 'error') || undefined}
        meta="kg/m3"
        onChange={(event: any) => handleChange(PillInputType.DENSITY, event.target.value)}
        disabled={isLoading}
      />
      <Button
        onClick={() => {
          handleOptimize()
        }}
        disabled={isLoading || invalidDensity || invalidVolume}>
        Run optimizer
      </Button>
    </Wrapper>
  )
}

export default PillInput
