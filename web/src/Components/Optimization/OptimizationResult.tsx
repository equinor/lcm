import {OptimizationData, Products} from '../../Types'
import SolutionData from '../Solution/SolutionData'
import SolutionVisualisations from '../Solution/SolutionVisualisations'

interface OptimizationResultProps {
  products: Products
  mode: string
  value: number
  optimizationData: OptimizationData
}

export const OptimizationResult = ({ products, optimizationData }: OptimizationResultProps) => {
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

export default OptimizationResult
