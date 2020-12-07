import React, { ReactElement } from 'react'
// @ts-ignore
import { Slider, Typography } from '@equinor/eds-core-react'
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
  setWeight: Function
}

export const WeightOptions = ({ weight, setWeight }: WeightOptionsProps): ReactElement => {
  const { bridge, mass, products } = weight

  return (
    <div style={{ width: '400px', margin: '0 10px', border: 'solid 1px #E8E5E5' }}>
      <div style={{ padding: '10px 0' }}>
        <Tooltip
          text={
            'Set importance (0-10) to fine tune the optimization algorithm. These values only has meaning relative to each other.'
          }>
          <Typography style={{ margin: '0 10px' }}>Weigthing</Typography>
        </Tooltip>
      </div>
      <div>
        <Wrapper>
          <span style={{ color: '#3D3D3D' }}>Bridge fit</span>
          <Slider
            id='Bridge'
            value={bridge}
            min={0}
            max={10}
            onChange={(event: any, value: number) => {
              setWeight({
                ...weight,
                bridge: value,
              })
            }}
            ariaLabelledby={''}
          />
        </Wrapper>
        <Wrapper>
          <span style={{ color: '#3D3D3D' }}>Mass</span>
          <Slider
            id='Mass'
            value={mass}
            min={0}
            max={10}
            onChange={(event: any, value: any) => {
              setWeight({
                ...weight,
                mass: value,
              })
            }}
            ariaLabelledby={''}
          />
        </Wrapper>
        <Wrapper>
          <span style={{ color: '#3D3D3D' }}>Number of products</span>
          <Slider
            id='Products'
            value={products}
            min={0}
            max={10}
            onChange={(event: any, value: any) => {
              setWeight({
                ...weight,
                products: value,
              })
            }}
            ariaLabelledby={''}
          />
        </Wrapper>
      </div>
    </div>
  )
}
