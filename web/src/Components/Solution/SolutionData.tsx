import React, { ReactElement, useContext, useState } from 'react'
// @ts-ignore
import { Button, Typography, CircularProgress } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { ProductResult } from '../Optimization/OptimizationContainer'
import { Products } from '../../Types'
import { ReportAPI } from '../../Api'
import { AuthContext } from '../../Auth/AuthProvider'
import { ErrorToast } from '../Common/Toast'

const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 130px);
  grid-gap: 0 0;
`

const Spacer = styled.div`
  padding-bottom: 32px;
`

interface SolutionDataProps {
  optimizationData: any
  products: Products
}

interface SacksProps {
  products: Products
  productResults: Array<ProductResult>
  totalMass: number
}

const Sacks = ({ products, productResults, totalMass }: SacksProps): ReactElement => {
  return (
    <div>
      {Object.values(productResults).map((productResult: ProductResult) => {
        return (
          <Grid key={productResult.id}>
            <Typography variant='body_short'>{products[productResult.id].title}</Typography>
            <Typography variant='body_short'>{productResult.value} sacks</Typography>
          </Grid>
        )
      })}

      <Grid>
        <Typography variant='body_short'>Total mass: </Typography>
        <Typography variant='body_short'>{totalMass} kg</Typography>
      </Grid>
    </div>
  )
}

const SolutionData = ({ products, optimizationData }: SolutionDataProps) => {
  const apiToken: string = useContext(AuthContext).token
  const [loading, setLoading] = useState<boolean>(false)

  function onExportClick() {
    const reportRequest = {
      fitness: optimizationData.fitness,
      pillVolume: 0.0,
      pillDensity: 0.0,
      bridgingMode: optimizationData.config.mode,
      bridgingValue: optimizationData.config.value,
      iterations: optimizationData.config.iterations,
      totalMass: optimizationData.totalMass,
      products: optimizationData.products,
      weighting: optimizationData.weighting,
    }
    setLoading(true)
    ReportAPI.postReportApi(apiToken, reportRequest)
      .then(res => {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(res.data)
        link.target = '_blank'
        link.click()
        setLoading(false)
      })
      .catch(error => {
        ErrorToast('Failed to open PDF report', error.response.status)
        console.error(error.response.data)
        setLoading(false)
      })
  }

  return (
    <div>
      <Spacer>
        <Typography variant='h4'>Optimal solution</Typography>
      </Spacer>
      <Spacer>
        <Typography variant='h6'>Optimal blend:</Typography>
        <Sacks products={products} productResults={optimizationData.products} totalMass={optimizationData.totalMass} />
      </Spacer>
      <Typography variant='h6'>Performance:</Typography>
      <Grid>
        <Typography variant='body_short'>Score:</Typography>
        <Typography variant='body_short'>{optimizationData.fitness.toFixed(2)}</Typography>
        <Typography variant='body_short'>Time:</Typography>
        <Typography variant='body_short'>{optimizationData.executionTime} seconds</Typography>
      </Grid>
      <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '20px' }}>
        <Button onClick={() => onExportClick()} style={{ width: '150px' }}>
          Export solution
        </Button>

        {loading && (
          <div style={{ marginTop: '20px', marginLeft: '50px' }}>
            <CircularProgress />
          </div>
        )}
      </div>
    </div>
  )
}

export default SolutionData
