import React, { ReactElement } from 'react'
import SolutionData from './SolutionData'
import SolutionVisualisations from './SolutionVisualisations'
import { Products } from '../../Types'

interface OptimizationResultProps {
  products: Products
  mode: string
  value: number
  optimizationData: any
}

export const OptimizationResult = ({ products, optimizationData }: OptimizationResultProps): ReactElement => {
  if (!optimizationData) return <div />

  return (
    <>
      <SolutionData products={products} optimizationData={optimizationData} />
      <SolutionVisualisations products={products} optimizationData={optimizationData} />
    </>
  )
}

export default OptimizationResult
