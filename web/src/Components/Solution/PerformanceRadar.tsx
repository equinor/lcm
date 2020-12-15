import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  // @ts-ignore
} from 'recharts'

interface IPerformanceRadar {
  performanceData: any
}

export const PerformanceRadar = ({ performanceData }: IPerformanceRadar) => {
  const graphData = [
    { name: 'Fit', value: performanceData.bridge, fullMark: 100 },
    { name: 'Mass', value: performanceData.mass, fullMark: 100 },
    { name: 'Products', value: performanceData.products, fullMark: 100 },
  ]
  return (
    <RadarChart cx={200} cy={150} outerRadius={100} width={350} height={300} data={graphData}>
      <PolarGrid />
      <PolarAngleAxis dataKey='name' />
      <PolarRadiusAxis />
      <Radar name='Mike' dataKey='value' stroke='#73B1B5' fill='#73B1B5' fillOpacity={0.6} />
    </RadarChart>
  )
}

export default PerformanceRadar
