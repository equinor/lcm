import React from 'react'
import styled from 'styled-components'
// @ts-ignore
import { Typography } from '@equinor/eds-core-react'
import SolutionBarChart from './SolutionBarChart'
import PerformanceRadar from './PerformanceRadar'
import { Products } from '../../Types'

const Grid = styled.div`
  height: auto;
  width: fit-content;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
`

interface SolutionVisualisationsProps {
  optimizationData: any
  products: Products
}

export const SolutionVisualisations = ({ optimizationData, products }: SolutionVisualisationsProps) => {
  return (
    <div style={{ width: 'fit-content', backgroundColor: '#e4f2f8' }}>
      <Grid>
        <div>
          <Typography variant='h6'>Optimal blend</Typography>
          <SolutionBarChart optimizationData={optimizationData} products={products} />
        </div>
        <div>
          <Typography variant='h6'>Scores</Typography>
          <PerformanceRadar performanceData={optimizationData.performance} />
        </div>
      </Grid>
    </div>
  )
}

export default SolutionVisualisations
