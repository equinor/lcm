// @ts-ignore
import { Slider, Typography } from '@equinor/eds-core-react'
import type { ReactElement } from 'react'
// @ts-ignore
import styled from 'styled-components'
import { Tooltip } from '../Common/Tooltip'

const Wrapper = styled.div`
  padding: 10px 10px 25px 10px;
  margin: 10px;
  background-color: white;
  border-radius: 10px;
`

export interface Weight {
  bridge: number
  mass: number
  products: number
  environmental?: Array<Environmental>
}

export enum Environmental {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  BLACK = 'BLACK',
}

interface WeightOptionsProps {
  weight: Weight
  setWeight: (weight: Weight) => void
}

export const WeightOptions = ({ weight, setWeight }: WeightOptionsProps): ReactElement => {
  const { bridge, mass, products } = weight

  // after a recent update, the Slider component from equinor/eds is meant to be used for a range of numbers.
  // This function lets us use the Slider component for a single number instead
  const getSliderValue = (value: number | number[]): number => {
    if (typeof value === 'number') {
      return value
    }
    if (value.length === 1) {
      return value[0]
    }
    throw new Error('Could not change slider value')
  }

  return (
    <div style={{ width: '400px', margin: '0 10px', border: 'solid 1px #E8E5E5' }}>
      <div style={{ padding: '10px 0' }}>
        <Tooltip
          text={
            'Set importance (0-10) to fine tune the optimization algorithm. These values only has meaning relative to each other.'
          }
        >
          <Typography>Weigthing</Typography>
        </Tooltip>
      </div>
      <div>
        <Wrapper>
          <span style={{ color: '#3D3D3D' }}>Bridge fit</span>
          <Slider
            id="Bridge"
            value={bridge}
            min={1}
            max={10}
            onChange={(_: any, value: number | number[]) => {
              setWeight({
                ...weight,
                bridge: getSliderValue(value),
              })
            }}
            ariaLabelledby={''}
          />
        </Wrapper>
        <Wrapper>
          <span style={{ color: '#3D3D3D' }}>Mass</span>
          <Slider
            id="Mass"
            value={mass}
            min={1}
            max={10}
            // @ts-ignore
            onChange={(_: any, value: number) => {
              setWeight({
                ...weight,
                mass: getSliderValue(value),
              })
            }}
            ariaLabelledby={''}
          />
        </Wrapper>
        <Wrapper>
          <span style={{ color: '#3D3D3D' }}>Number of products</span>
          <Slider
            id="Products"
            value={products}
            min={1}
            max={10}
            // @ts-ignore
            onChange={(_: any, value: number) => {
              setWeight({
                ...weight,
                products: getSliderValue(value),
              })
            }}
            ariaLabelledby={''}
          />
        </Wrapper>
      </div>
    </div>
  )
}
