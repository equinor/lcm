import React, { ReactElement } from 'react'
// @ts-ignore
import { Slider, Card, Typography, Checkbox } from '@equinor/eds-core-react'
import styled from 'styled-components'
import WeigthChart from './WeigthChart.js'

const Wrapper = styled.div`
  padding-bottom: 2rem;
`

const UnstyledList = styled.ul`
  margin: 0px;
  padding: 0px;
  list-style-type: none;
`

const Grid = styled.div`
  height: auto;
  width: fit-content;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 300px);
  grid-gap: 100px 100px;
  align-items: center;
`

const GridUpper = styled.div`
  height: auto;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 300px);
  grid-gap: 100px 100px;
`

const GridFilter = styled.div`
  height: auto;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(1, 600px);
`

const EnvironmentalWrapper = styled.div`
  margin: 0px;
  display: grid;
  grid-gap: 0px;
  grid-template-columns: repeat(4, 150px);
`

export interface Weight {
  fit: number
  co2: number
  cost: number
  mass: number
  environmental: Array<Environmental>
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
  isLoading: boolean
}

export const WeightOptions = ({ weight, setWeight, isLoading }: WeightOptionsProps): ReactElement => {
  const { fit, co2, cost, mass } = weight

  const handleEnvironmentChange = (type: Environmental) => {
    const environment = weight.environmental.includes(type)
      ? weight.environmental.filter(environment => environment !== type)
      : [...weight.environmental, type]

    setWeight({
      ...weight,
      environment: environment,
    })
  }

  return (
    <Card style={{ width: 'fit-content' }}>
      <GridUpper>
        <Typography variant="h6">Weigthing</Typography>
      </GridUpper>
      <Grid>
        <div>
          <Wrapper>
            <span style={{ color: '#3D3D3D' }}>Fit</span>
            <Slider
              id="Fit"
              value={fit}
              min={0}
              max={10}
              onChange={(event: any, value: number) => {
                setWeight({
                  ...weight,
                  fit: value,
                })
              }}
              disabled={isLoading}
            />
          </Wrapper>
          <Wrapper>
            <span style={{ color: '#3D3D3D' }}>Cost</span>
            <Slider
              id="Cost"
              value={cost}
              min={0}
              max={10}
              onChange={(event: any, value: any) => {
                setWeight({
                  ...weight,
                  cost: value,
                })
              }}
              disabled={isLoading}
            />
          </Wrapper>

          <Wrapper>
            <span style={{ color: '#3D3D3D' }}>CO2</span>
            <Slider
              id="CO2"
              value={co2}
              min={0}
              max={10}
              onChange={(event: any, value: any) => {
                setWeight({
                  ...weight,
                  co2: value,
                })
              }}
              disabled={isLoading}
            />
          </Wrapper>
          <Wrapper>
            <span style={{ color: '#3D3D3D' }}>Mass</span>
            <Slider
              id="Mass"
              value={mass}
              min={0}
              max={10}
              onChange={(event: any, value: any) => {
                setWeight({
                  ...weight,
                  mass: value,
                })
              }}
              disabled={isLoading}
            />
          </Wrapper>
        </div>
        <WeigthChart fit={fit} cost={cost} co2={co2} mass={mass} />
      </Grid>
      <GridUpper>
        <Typography variant="h6">Environmental</Typography>
      </GridUpper>
      <GridFilter>
        <div>
          <UnstyledList>
            <EnvironmentalWrapper>
              <li>
                <Checkbox
                  label="Green"
                  name="multiple"
                  onChange={(event: any) => handleEnvironmentChange(Environmental.GREEN)}
                  checked={weight.environmental.includes(Environmental.GREEN)}
                  value="Green"
                  disabled={isLoading}
                />
              </li>
              <li>
                <Checkbox
                  label="Yellow"
                  name="multiple"
                  onChange={(event: any) => handleEnvironmentChange(Environmental.YELLOW)}
                  checked={weight.environmental.includes(Environmental.YELLOW)}
                  value="Yellow"
                  disabled={isLoading}
                />
              </li>
              <li>
                <Checkbox
                  label="Red"
                  name="multiple"
                  onChange={(event: any) => handleEnvironmentChange(Environmental.RED)}
                  checked={weight.environmental.includes(Environmental.RED)}
                  value="Red"
                  disabled={isLoading}
                />
              </li>
              <li>
                <Checkbox
                  label="Black"
                  name="multiple"
                  onChange={(event: any) => handleEnvironmentChange(Environmental.BLACK)}
                  checked={weight.environmental.includes(Environmental.BLACK)}
                  value="Black"
                  disabled={isLoading}
                />
              </li>
            </EnvironmentalWrapper>
          </UnstyledList>
        </div>
      </GridFilter>
      <Typography variant="body_long" style={{ color: '#858585' }}>
        *Note that these weightings are not well-defined, and only serve to tune the optimizing algorithm based on the
        different categories.
      </Typography>
    </Card>
  )
}
