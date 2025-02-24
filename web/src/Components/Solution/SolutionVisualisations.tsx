// @ts-ignore
import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'
import type { Products } from '../../Types'
import PerformanceRadar from './PerformanceRadar'
import SolutionBarChart from './SolutionBarChart'

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
    <div
      style={{
        width: 'fit-content',
        backgroundColor: '#e4f2f8',
        overflow: 'auto',
      }}
    >
      <Grid>
        <div>
          <Typography variant="h6">Optimal blend</Typography>
          <SolutionBarChart optimizationData={optimizationData} products={products} />
        </div>
        <div>
          <div style={{ margin: '0 auto' }}>
            <Typography variant="h6" style={{ float: 'left' }}>
              Scores
            </Typography>
            <Typography variant="h6" style={{ float: 'right', marginRight: '43%' }}>
              Total score: {optimizationData.fitness.toFixed(2)}
            </Typography>
          </div>
          <PerformanceRadar optimizationData={optimizationData} />
        </div>
      </Grid>
    </div>
  )
}

export default SolutionVisualisations
