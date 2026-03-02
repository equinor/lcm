import type { OptimizationData, Products } from '../../lib/types'
import { SolutionData } from '../Solution/SolutionData'
import { SolutionVisualisations } from '../Solution/SolutionVisualisations'

type OptimizationResultProps = {
  products: Products
  mode: string
  value: number
  optimizationData: OptimizationData | undefined
}

export function OptimizationResult({ products, optimizationData }: OptimizationResultProps) {
  if (!optimizationData) return null

  return (
    <div style={{ display: 'flex', paddingTop: '30px' }}>
      <div style={{ width: '350px', paddingRight: '20px' }}>
        <SolutionData products={products} optimizationData={optimizationData} />
      </div>
      <SolutionVisualisations products={products} optimizationData={optimizationData} />
    </div>
  )
}
