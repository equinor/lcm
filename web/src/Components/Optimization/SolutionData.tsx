import React, { ReactElement } from 'react'
// @ts-ignore
import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'
import ExportButton from './ExportButton.js'
import { Product } from '../../gen-api/src/models'
import { ProductResult } from './OptimizationContainer'

const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 0px;
  padding-bottom: 0px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 130px);
  grid-gap: 0px 0px;
`

const Wrapper = styled.div`
  padding-bottom: 32px;
`

interface SolutionDataProps {
  optimizationData: any
  products: Map<string, Product>
  isLoading: boolean
}

interface SackProps {
  products: Map<string, Product>
  productResult: ProductResult
}

const getTotalMass = (products: Map<string, Product>, productResults: Array<ProductResult>) => {
  let totalMass = 0
  if (productResults.length !== 0) {
    productResults.forEach((productResult: ProductResult) => {
      // @ts-ignore
      totalMass += productResult.sacks * products[productResult.id].sackSize
    })
  }
  return totalMass
}

const Sack = ({ products, productResult }: SackProps): ReactElement => {
  // @ts-ignore
  const title = products[productResult.id].id
  return (
    <Grid>
      <Typography variant="body_short">{title}</Typography>
      <Typography variant="body_short">{productResult.sacks} sacks</Typography>
    </Grid>
  )
}

interface SacksProps {
  products: Map<string, Product>
  productResults: Array<ProductResult>
}

const Sacks = ({ products, productResults }: SacksProps): ReactElement => {
  const sackElements = productResults.map((productResult: ProductResult) => {
    return <Sack key={productResult.id} products={products} productResult={productResult} />
  })
  return (
    <div>
      {sackElements}

      <Grid>
        <Typography variant="body_short">Total mass: </Typography>
        <Typography variant="body_short">{getTotalMass(products, productResults)} kg</Typography>
      </Grid>
    </div>
  )
}

const SolutionData = ({ products, optimizationData, isLoading }: SolutionDataProps) => {
  let productResults: Array<ProductResult> = optimizationData.products

  if (productResults.length === 0) {
    return (
      <Typography variant="body_short" style={{ color: '#EC462F' }}>
        No solution found
      </Typography>
    )
  }

  return (
    <div>
      <Wrapper>
        <Typography variant="h4">Optimal solution</Typography>
      </Wrapper>
      <Wrapper>
        <Wrapper>
          <Typography variant="h6">Optimal blend:</Typography>
        </Wrapper>
        <Sacks products={products} productResults={productResults} />
      </Wrapper>
      <Wrapper>
        <Typography variant="h6">Performance:</Typography>
      </Wrapper>
      <Wrapper>
        <Grid>
          <Typography variant="body_short">Iterations:</Typography>
          <Typography variant="body_short">{optimizationData.iterations}</Typography>
          <Typography variant="body_short">Time:</Typography>
          <Typography variant="body_short">{optimizationData.executionTime.toFixed(2)} sec</Typography>
        </Grid>
      </Wrapper>
      <ExportButton fetched={true} loading={isLoading} optimizationData={optimizationData} productMap={products} />
    </div>
  )
}

export default SolutionData
