import React, { ReactElement, useState } from 'react'
import OptimizationRunner from './OptimizationRunner'
import OptimizationResult from './OptimizationResult'
import { Combination, Products } from '../../Types'

interface OptimizationContainerProps {
  products: Products
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
  mode,
  addCombination,
  value,
}: OptimizationContainerProps): ReactElement => {
  const [optimizationData, setOptimizationData] = useState<any>(undefined)

  const handleUpdate = (optimizationData: any) => {
    setOptimizationData(optimizationData)

    if (Object.keys(optimizationData.products).length === 0) {
      alert('Could not find a solution. Try changing some parameters')
      return
    }
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
  }

  return (
    <div>
      <OptimizationRunner allProducts={products} mode={mode} value={value} handleUpdate={handleUpdate} />
      <OptimizationResult products={products} mode={mode} value={value} optimizationData={optimizationData} />
    </div>
  )
}

export default OptimizationContainer
