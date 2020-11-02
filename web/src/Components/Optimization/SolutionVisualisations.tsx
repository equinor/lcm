import React from 'react'
import styled from 'styled-components'
// @ts-ignore
import { Card, Typography } from '@equinor/eds-core-react'
import SolutionBarChart from './SolutionBarChart'
import SolutionRadarChart from './SolutionRadarChart'
import { Product } from '../../gen-api/src/models'
import { Products } from '../../Types'

const Grid = styled.div`
  height: auto;
  width: fit-content;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 300px);
  grid-gap: 20px 100px;
  align-items: center;
`

interface SolutionVisualisationsProps {
  optimizationData: any
  products: Products
}

export const SolutionVisualisations = ({ optimizationData, products }: SolutionVisualisationsProps) => {
  return (
    <Card variant="info" style={{ width: 'fit-content' }}>
      <Grid>
        <Typography variant="h6">Optimal blend</Typography>
        <Typography variant="h6">Scores</Typography>
        <SolutionBarChart optimizationData={optimizationData} products={products} />
        <SolutionRadarChart optimizationData={optimizationData} />
      </Grid>
    </Card>
  )
}

export default SolutionVisualisations
