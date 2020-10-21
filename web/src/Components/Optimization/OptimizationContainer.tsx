import React, { ReactElement, useState } from 'react'
import styled from 'styled-components'
import { Product } from '../../gen-api/src/models'
import OptimizationRunner from './OptimizationRunner'
import OptimizationResult from './OptimizationResult'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
import { Combinations, Combination, ProductValues, ProductsInCombination } from '../CombinationsWrapper'

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
  combinations: Combinations
  setCombinations: Function
  mode: string
  value: number
}

export interface ProductResult {
  id: string
  sacks: number
}

export const OptimizationContainer = ({
  products,
  enabledProducts,
  combinations,
  mode,
  setCombinations,
  value,
}: OptimizationContainerProps): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [optimizationData, setOptimizationData] = useState()

  const handleUpdate = (optimizationData: any) => {
    setOptimizationData(optimizationData)

    // TODO: Get this interface through OpenAPI
    let productResults: Array<ProductResult> = optimizationData.products
    let values: ProductsInCombination = {}
    if (productResults.length !== 0) {
      const massSum = productResults.reduce(
        (total: number, productResult: ProductResult) =>
          // @ts-ignore
          total + +productResult.sacks * +products[productResult.id].sackSize,
        0
      )
      productResults.forEach((productResult: any) => {
        if (productResult.sacks !== 0) {
          values[productResult.id] = {
            id: productResult.id,
            value: productResult.sacks,
            percentage:
              100 *
              // @ts-ignore
              ((productResult.sacks * products[productResult.id].sackSize) / massSum),
          }
        }
      })
    }

    const datetime = new Date()
    const name = `Optimized at ${(datetime.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${datetime.getDate().toString().padStart(2, '0')}/${datetime
      .getFullYear()
      .toString()
      .padStart(4, '0')} ${datetime.getHours().toString().padStart(2, '0')}:${datetime
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${datetime.getSeconds().toString().padStart(2, '0')}`

    addCombination(name, true, values)
    setIsLoading(false)
  }

  const addCombination = (name: string, sacks: boolean, values: ProductsInCombination) => {
    const combination: Combination = {
      id: uuidv4(),
      name: name,
      sacks: sacks,
      values: values,
      cumulative: null,
    }
    setCombinations({ ...combinations, [combination.id]: combination })
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
          combinationMap={combinations}
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
