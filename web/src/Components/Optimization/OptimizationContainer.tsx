import React, { ReactElement, useState } from 'react'
import styled from 'styled-components'
import { Combination } from '../../Pages/Main'
import { Product } from '../../gen-api/src/models'
import OptimizationRunner from './OptimizationRunner'
import OptimizationResult from './OptimizationResult'

const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 260px);
  grid-gap: 32px 32px;
`

interface OptimizationContainerProps {
  products: Map<string, Product>
  enabledProducts: Array<string>
  combinationMap: Map<string, Combination>
  mode: string
  value: number
  addCombination: Function
}

export interface ProductResult {
  id: string
  sacks: number
}

export const OptimizationContainer = ({
  products,
  enabledProducts,
  combinationMap,
  mode,
  value,
  addCombination,
}: OptimizationContainerProps): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [optimizationData, setOptimizationData] = useState()

  const handleUpdate = (optimizationData: any) => {
    setOptimizationData(optimizationData)

    // TODO: Get this interface through OpenAPI
    let productResults: Array<ProductResult> = optimizationData.products
    let values = new Map()
    if (productResults.length !== 0) {
      const massSum = productResults.reduce(
        (total: number, productResult: ProductResult) =>
          // @ts-ignore
          total + +productResult.sacks * +products[productResult.id].sackSize,
        0
      )
      productResults.forEach((productResult: any) => {
        if (productResult.sacks !== 0) {
          let value = {
            id: productResult.id,
            value: productResult.sacks,
            percentage:
              100 *
              // @ts-ignore
              ((productResult.sacks * products[productResult.id].sackSize) /
                massSum),
          }
          values.set(value.id, value)
        }
      })
    }

    const datetime = new Date()

    const name = `Optimized at ${(datetime.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${datetime
      .getDate()
      .toString()
      .padStart(2, '0')}/${datetime
      .getFullYear()
      .toString()
      .padStart(4, '0')} ${datetime
      .getHours()
      .toString()
      .padStart(2, '0')}:${datetime
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${datetime.getSeconds().toString().padStart(2, '0')}`

    addCombination(name, true, values)
    setIsLoading(false)
  }

  return (
    <div>
      <Grid>
        <OptimizationRunner
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          products={products}
          enabledProducts={enabledProducts}
          mode={mode}
          value={value}
          combinationMap={combinationMap}
          handleUpdate={handleUpdate}
        />
      </Grid>

      <Grid>
        <OptimizationResult
          isLoading={isLoading}
          products={products}
          mode={mode}
          value={value}
          optimizationData={optimizationData}
        />
      </Grid>
    </div>
  )
}

export default OptimizationContainer
