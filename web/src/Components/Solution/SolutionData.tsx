// @ts-ignore
import { Button, CircularProgress, Icon, Typography } from '@equinor/eds-core-react'
import { save } from '@equinor/eds-icons'
import { type ReactElement, useContext, useEffect, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import styled from 'styled-components'
import { ReportAPI } from '../../Api'
import type { OptimizationData, Products } from '../../Types'
import { ErrorToast } from '../Common/Toast'
import type { ProductResult } from '../Optimization/OptimizationContainer'

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
  optimizationData: OptimizationData
  products: Products
}

interface DensitiesProps {
  products: Products
  productResults: Array<ProductResult>
}

const Densities = ({ products, productResults }: DensitiesProps): ReactElement => {
  const getSumOfDensities = () => {
    let sum = 0
    Object.values(productResults).forEach((result) => {
      sum += result.value
    })
    return sum.toFixed(1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Object.values(productResults).map((productResult: ProductResult) => {
        productResult.value = Number.parseFloat(productResult.value.toFixed(1))
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
  const { tokenData, token } = useContext(AuthContext)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    window.scrollTo(0, 999999)
  }, [])

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
      email: tokenData.upn || 'none',
      user: tokenData.name,
    }
    setLoading(true)
    ReportAPI.postReportApi(token, reportRequest)
      .then((res) => {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(res.data)
        link.target = '_blank'
        link.click()
        setLoading(false)
      })
      .catch((error) => {
        ErrorToast('Failed to open PDF report', error.response.status)
        console.error(error.response.data)
        setLoading(false)
      })
  }

  return (
    <div>
      <Spacer>
        <Typography variant="h4">Optimal solution</Typography>
      </Spacer>
      <Spacer>
        <Typography variant="h6">Optimal blend:</Typography>
        <Densities products={products} productResults={Object.values(optimizationData.products)} />
      </Spacer>
      <Typography variant="h6">Performance:</Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <LabelWrapper>
          <TextWrapper>Score:</TextWrapper>
          <TextWrapper>{optimizationData.fitness.toFixed(2)}</TextWrapper>
        </LabelWrapper>
        <LabelWrapper>
          <TextWrapper>Time:</TextWrapper>
          <TextWrapper>{optimizationData.executionTime}ms</TextWrapper>
        </LabelWrapper>
      </div>
      <div style={{ display: 'flex', paddingTop: '20px' }}>
        <Button onClick={() => onExportClick()} style={{ width: '170px' }} disabled={loading}>
          <Icon data={save} title="export" />
          Export solution
        </Button>

        {loading && <CircularProgress style={{ padding: '0 15px', height: '35px', width: '35px' }} />}
      </div>
    </div>
  )
}

export default SolutionData
