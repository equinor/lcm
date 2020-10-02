import React, { ReactElement } from 'react'
import SolutionData from './SolutionData'
import SolutionVisualisations from './SolutionVisualisations'
import { Product } from '../../gen-api/src/models'

interface OptimizationResultProps {
  products: Map<string, Product>
  mode: string
  value: number
  isLoading: boolean
  optimizationData: any
}

export const OptimizationResult = ({
  products,
  isLoading,
  optimizationData,
}: OptimizationResultProps): ReactElement => {
  if (!optimizationData || isLoading) return <div></div>

  return (
    <>
      <SolutionData products={products} isLoading={isLoading} optimizationData={optimizationData} />
      <SolutionVisualisations products={products} optimizationData={optimizationData} />
    </>
  )
}

export default OptimizationResult
