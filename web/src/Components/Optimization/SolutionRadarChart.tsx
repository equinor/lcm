import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  // @ts-ignore
} from 'recharts'

interface SolutionRadarChartProps {
  optimizationData: any
}

export const SolutionRadarChart = ({ optimizationData }: SolutionRadarChartProps) => {
  const graphData = [
    { name: 'Fit', value: optimizationData.performance['best_fit'] },
    { name: 'Cost', value: optimizationData.performance['cost'] },
    { name: 'CO2', value: optimizationData.performance['co2'] },
    { name: 'Mass', value: optimizationData.performance['mass_fit'] },
    { name: 'Env.', value: optimizationData.performance['enviromental'] },
  ]
  return (
    <RadarChart cx={150} cy={150} outerRadius={100} width={300} height={300} data={graphData}>
      <PolarGrid />
      <PolarAngleAxis dataKey="name" />
      <PolarRadiusAxis />
      <Radar name="Mike" dataKey="value" stroke="#73B1B5" fill="#73B1B5" fillOpacity={0.6} />
    </RadarChart>
  )
}

export default SolutionRadarChart
