import React, { ReactElement, useState } from 'react'
import styled from 'styled-components'
import OptimizationRunner from './OptimizationRunner'
import OptimizationResult from './OptimizationResult'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
import { Combinations, Combination, ProductsInCombination } from '../CombinationsWrapper'
import { Products } from '../../Types'

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
  products: Products
  enabledProducts: Array<string>
  combinations: Combinations
  setCombinations: Function
  mode: string
  value: number
}

export interface ProductResult {
  id: string
  value: number
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
  const [optimizationData, setOptimizationData] = useState<any>(undefined)

  const handleUpdate = (optimizationData: any) => {
    setOptimizationData(optimizationData)

    const datetime = new Date()
    const name = `Optimized at ${datetime
      .getHours()
      .toString()
      .padStart(2, '0')}:${datetime
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${datetime.getSeconds().toString().padStart(2, '0')}`

    addCombination(name, true, optimizationData.products)
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
        <OptimizationResult products={products} mode={mode} value={value} optimizationData={optimizationData} />
      </Grid>
    </div>
  )
}

export default OptimizationContainer
