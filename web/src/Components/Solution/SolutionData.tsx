import React, { ReactElement, useContext, useState } from 'react'
// @ts-ignore
import { Button, Typography, CircularProgress } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { ProductResult } from '../Optimization/OptimizationContainer'
import { Products } from '../../Types'
import { ReportAPI } from '../../Api'
import { ErrorToast } from '../Common/Toast'
import { AuthContext, User } from '../../Context'

const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const TextWrapper = styled.div`
  padding: 5px 10px 0 0;
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Object.values(productResults).map((productResult: ProductResult) => {
        return (
          <LabelWrapper key={productResult.id}>
            <TextWrapper>{products[productResult.id].title}</TextWrapper>
            <TextWrapper>{productResult.value} sacks</TextWrapper>
          </LabelWrapper>
        )
      })}

      <LabelWrapper>
        <TextWrapper>Total mass: </TextWrapper>
        <TextWrapper>{totalMass} kg</TextWrapper>
      </LabelWrapper>
    </div>
  )
}

const SolutionData = ({ products, optimizationData }: SolutionDataProps) => {
  const user: User = useContext(AuthContext)
  const [loading, setLoading] = useState<boolean>(false)

  function onExportClick() {
    const reportRequest = {
      fitness: optimizationData.fitness,
      curve: optimizationData.curve,
      pillVolume: 0.0,
      pillDensity: 0.0,
      bridgingMode: optimizationData.config.mode,
      bridgingValue: optimizationData.config.value,
      iterations: optimizationData.config.iterations,
      totalMass: optimizationData.totalMass,
      products: optimizationData.products,
      weighting: optimizationData.weighting,
      email: user.email,
      user: user.name,
    }
    setLoading(true)
    ReportAPI.postReportApi(user.token, reportRequest)
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <LabelWrapper>
          <TextWrapper>Score:</TextWrapper>
          <TextWrapper>{optimizationData.fitness.toFixed(2)}</TextWrapper>
        </LabelWrapper>
        <LabelWrapper>
          <TextWrapper>Time:</TextWrapper>
          <TextWrapper>{optimizationData.executionTime} seconds</TextWrapper>
        </LabelWrapper>
      </div>
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
