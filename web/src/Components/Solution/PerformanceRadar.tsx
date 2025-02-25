import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts'
import type { OptimizationData } from '../../Types'

interface IPerformanceRadar {
  optimizationData: OptimizationData
}

export const PerformanceRadar = ({ optimizationData }: IPerformanceRadar) => {
  const performanceData = optimizationData.performance
  const graphData = [
    {
      name: `Fit: ${optimizationData.bridgeScore.toFixed(1)}% (standard deviation)`,
      value: performanceData.bridge,
      fullMark: 100,
    },
    {
      name: `Mass: ${optimizationData.totalMass}kg/${optimizationData.chosenMass}kg`,
      value: performanceData.mass,
      fullMark: 100,
    },
    {
      name: `Products: ${Object.keys(optimizationData.products).length}/${optimizationData.maxNumberOfProducts} used`,
      value: performanceData.products,
      fullMark: 100,
    },
  ]
  return (
    <RadarChart cx={250} cy={150} outerRadius={100} width={540} height={300} data={graphData}>
      <PolarGrid />
      <PolarAngleAxis dataKey="name" />
      <PolarRadiusAxis />
      <Radar name="Mike" dataKey="value" stroke="#73B1B5" fill="#73B1B5" fillOpacity={0.6} />
    </RadarChart>
  )
}

export default PerformanceRadar
