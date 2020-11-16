import React, { ReactElement, useState } from 'react'
import OptimizationRunner from './OptimizationRunner'
import OptimizationResult from './OptimizationResult'
import { Combination } from '../CombinationsWrapper'
import { Products } from '../../Types'

interface OptimizationContainerProps {
  products: Products
  enabledProducts: Array<string>
  addCombination: Function
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
  mode,
  addCombination,
  value,
}: OptimizationContainerProps): ReactElement => {
  const [loading, setLoading] = useState<boolean>(false)
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

    const combination: Combination = {
      name: name,
      sacks: true,
      values: optimizationData.products,
      cumulative: null,
    }
    addCombination(combination)
    setLoading(false)
  }

  return (
    <div>
      <OptimizationRunner
        isLoading={loading}
        setIsLoading={setLoading}
        products={products}
        enabledProducts={enabledProducts}
        mode={mode}
        value={value}
        handleUpdate={handleUpdate}
      />
      <OptimizationResult products={products} mode={mode} value={value} optimizationData={optimizationData} />
    </div>
  )
}

export default OptimizationContainer
