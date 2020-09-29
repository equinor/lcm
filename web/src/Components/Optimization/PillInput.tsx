import React, { ReactElement, useState } from 'react'
import styled from 'styled-components'
// @ts-ignore
import { TextField, Button } from '@equinor/eds-core-react'

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: min-width;
  padding: 0px;
  grid-gap: 2rem;
  position: relative;
  transition: all 0.36s;
  grid-template-columns: repeat(1, fit-content(100%));
`

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
    if (Math.sign(parseInt(value)) <= 0) {
      type === 'volume' && setInvalidVolume(true)
      type === 'density' && setInvalidDensity(true)
    } else {
      type === 'volume' && setInvalidVolume(false)
      type === 'density' && setInvalidDensity(false)
    }

    if (type === 'volume') {
      setPill({
        volume: parseInt(value),
        mass: parseInt(value) * pill.density,
        density: pill.density,
      })
    }
    if (type === 'density') {
      setPill({
        volume: pill.volume,
        mass: parseInt(value) * pill.volume,
        density: parseInt(value),
      })
    }
  }

  return (
    <Wrapper>
      <TextField
        type="number"
        helperText={invalidVolume && 'Must be a positive number'}
        label="Enter pill volume"
        id="pillvolume"
        value={pill.volume}
        meta={
          <>
            m<sup>3</sup>
          </>
        }
        variant={(invalidVolume && 'error') || undefined}
        onChange={(event: any) => handleChange('volume', event.target.value)}
        disabled={isLoading}
      />
      <TextField
        type="number"
        label="Enter pill density"
        helperText={invalidDensity && 'Must be a positive number'}
        id="pilldensity"
        value={pill.density}
        variant={(invalidDensity && 'error') || undefined}
        meta={
          <>
            kg/m<sup>3</sup>
          </>
        }
        onChange={(event: any) => handleChange('density', event.target.value)}
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
