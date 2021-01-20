import React, { ReactElement, useContext, useState } from 'react'
// @ts-ignore
import { Button, Typography, CircularProgress } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { ProductResult } from '../Optimization/OptimizationContainer'
import { Products } from '../../Types'
import { ReportAPI } from '../../Api'
import { ErrorToast } from '../Common/Toast'
import { AuthContext, User } from '../../Context'
import Icon from '../../Icons'

const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const TextWrapper = styled.div`
  padding: 5px 10px 0 0;
  min-width: fit-content;
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

interface DensitiesProps {
  products: Products
  productResults: Array<ProductResult>
}

const Densities = ({ products, productResults }: DensitiesProps): ReactElement => {
  const getSumOfDensities = () => {
    let sum = 0
    Object.values(productResults).map(result => (sum += result.value))
    return sum.toFixed(1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Object.values(productResults).map((productResult: ProductResult) => {
        productResult.value = parseFloat(productResult.value.toFixed(1))
        return (
          <LabelWrapper key={productResult.id}>
            <TextWrapper>{products[productResult.id].title}</TextWrapper>
            <TextWrapper>
              {productResult.value} kg/m<sup>3</sup>
            </TextWrapper>
          </LabelWrapper>
        )
      })}
      <LabelWrapper>
        <TextWrapper>Sum of densities: </TextWrapper>
        <TextWrapper>
          {getSumOfDensities()} kg/m<sup>3</sup>
        </TextWrapper>
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
        <Densities products={products} productResults={optimizationData.products} />
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
      <div style={{ display: 'flex', paddingTop: '20px' }}>
        <Button onClick={() => onExportClick()} style={{ width: '170px' }} disabled={loading}>
          <Icon name='save' title='export' />
          Export solution
        </Button>

        {loading && <CircularProgress style={{ padding: '0 15px', height: '35px', width: '35px' }} />}
      </div>
    </div>
  )
}

export default SolutionData
