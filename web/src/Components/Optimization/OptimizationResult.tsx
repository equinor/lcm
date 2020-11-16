import React from 'react'
import SolutionData from './SolutionData'
import SolutionVisualisations from './SolutionVisualisations'
import { Products } from '../../Types'

interface OptimizationResultProps {
  products: Products
  mode: string
  value: number
  optimizationData: any
}

export const OptimizationResult = ({ products, optimizationData }: OptimizationResultProps) => {
  if (!optimizationData) return null

  return (
    <div style={{ display: 'flex' }}>
      <SolutionData products={products} optimizationData={optimizationData} />
      <SolutionVisualisations products={products} optimizationData={optimizationData} />
    </div>
  )
}

export default OptimizationResult
