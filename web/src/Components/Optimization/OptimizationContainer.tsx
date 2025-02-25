import { type ReactElement, useState } from 'react'
import type { Combination, OptimizationData, Products, ProductsInCombination } from '../../Types'
import OptimizationResult from './OptimizationResult'
import OptimizationRunner from './OptimizationRunner'

interface OptimizationContainerProps {
  products: Products
  addCombinationsFromOptimization: (sackCombination: Combination, densityCombination: Combination) => void
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
  addCombinationsFromOptimization,
  value,
}: OptimizationContainerProps): ReactElement => {
  const [densityOptimizationData, setDensityOptimizationData] = useState<OptimizationData>(undefined)

  const convertDensityOptimizationToSacks = (densityOptimizationData: OptimizationData): ProductsInCombination => {
    let sackProducts: ProductsInCombination = {}
    Object.values(densityOptimizationData.products).map((product) => {
      const SACK_KG: number = 25
      const sackValue: number = Math.round((product.value * densityOptimizationData.chosenVolume) / SACK_KG)
      if (sackValue > 0) {
        sackProducts = {
          ...sackProducts,
          [product.id]: { id: product.id, value: sackValue, percentage: 0 },
        }
      }
    })

    let totalNumberOfSacks = 0
    Object.values(sackProducts).map((product) => {
      totalNumberOfSacks += product.value
    })

    Object.values(sackProducts).map((product) => {
      sackProducts[product.id].percentage = (product.value / totalNumberOfSacks) * 100
    })

    //NOTE: since densities can be rounded down to 0 sacks, number of products in optimization for density and sacks can differ
    return sackProducts
  }

  const handleUpdate = (densityOptimizationData: OptimizationData) => {
    if (Object.keys(densityOptimizationData.products).length === 0) {
      alert('Could not find a solution. Try changing some parameters')
      return
    }
    const sackOptimizationValues = convertDensityOptimizationToSacks(densityOptimizationData)
    setDensityOptimizationData(densityOptimizationData)

    const datetime = new Date()
    const timeString = `${datetime.getHours().toString().padStart(2, '0')}:${datetime
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${datetime.getSeconds().toString().padStart(2, '0')}`
    const sackResultName = `Optimized at ${timeString} (sacks)`
    const densityResultName = `Optimized at ${timeString} (theoretical)`

    const sackCombination: Combination = {
      name: sackResultName,
      sacks: true,
      values: sackOptimizationValues,
      cumulative: null,
    }

    const densityCombination: Combination = {
      name: densityResultName,
      sacks: false,
      values: densityOptimizationData.products,
      cumulative: null,
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

export default OptimizationContainer
