import { useState } from 'react'
import type { Combination, OptimizationData, Products, ProductsInCombination } from '../../lib/types'
import { OptimizationResult } from './OptimizationResult'
import { OptimizationRunner } from './OptimizationRunner'

type OptimizationContainerProps = {
  products: Products
  addCombinationsFromOptimization: (sackCombination: Combination, densityCombination: Combination) => void
  mode: string
  value: number
}

export type ProductResult = {
  id: string
  value: number
}

export function OptimizationContainer({
  products,
  mode,
  addCombinationsFromOptimization,
  value,
}: OptimizationContainerProps) {
  const [densityOptimizationData, setDensityOptimizationData] = useState<OptimizationData>()

  function convertDensityOptimizationToSacks(densityOptimizationData: OptimizationData): ProductsInCombination {
    const sackProducts: ProductsInCombination = {}
    for (const product of Object.values(densityOptimizationData.products)) {
      const SACK_KG: number = 25
      const sackValue: number = Math.round((product.value * densityOptimizationData.chosenVolume) / SACK_KG)
      if (sackValue > 0) {
        sackProducts[product.id] = { id: product.id, value: sackValue, percentage: 0 }
      }
    }

    let totalNumberOfSacks = 0
    for (const product of Object.values(sackProducts)) {
      totalNumberOfSacks += product.value
    }
    for (const product of Object.values(sackProducts)) {
      sackProducts[product.id].percentage = (product.value / totalNumberOfSacks) * 100
    }

    //NOTE: since densities can be rounded down to 0 sacks, number of products in optimization for density and sacks can differ
    return sackProducts
  }

  function handleUpdate(densityOptimizationData: OptimizationData) {
    if (Object.keys(densityOptimizationData.products).length === 0) {
      alert('Could not find a solution. Try changing some parameters')
      return
    }
    const sackOptimizationValues = convertDensityOptimizationToSacks(densityOptimizationData)
    setDensityOptimizationData(densityOptimizationData)

    const timeString = new Date().toLocaleTimeString('nb-NO')
    const sackResultName = `Optimized at ${timeString} (sacks)`
    const densityResultName = `Optimized at ${timeString} (theoretical)`

    const sackCombination: Combination = {
      name: sackResultName,
      sacks: true,
      values: sackOptimizationValues,
      cumulative: [],
    }

    const densityCombination: Combination = {
      name: densityResultName,
      sacks: false,
      values: densityOptimizationData.products,
      cumulative: [],
    }

    addCombinationsFromOptimization(sackCombination, densityCombination)
  }

  return (
    <div>
      <OptimizationRunner allProducts={products} mode={mode} value={value} handleUpdate={handleUpdate} />
      <OptimizationResult products={products} mode={mode} value={value} optimizationData={densityOptimizationData} />
    </div>
  )
}
