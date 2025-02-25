import { PureComponent } from 'react'

import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import type { OptimizationData, Products } from '../../Types'
import type { ProductResult } from '../Optimization/OptimizationContainer'

interface CustomizedAxisTickProps {
  x: number
  y: number
  payload: { value: number }
}

class CustomizedAxisTick extends PureComponent<CustomizedAxisTickProps> {
  render() {
    const { x, y, payload } = this.props
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={8} textAnchor="end" fill="#666" transform="rotate(-60)">
          {payload.value}
        </text>
      </g>
    )
  }
}

interface SolutionBarChartProps {
  products: Products
  optimizationData: OptimizationData
}

export const SolutionBarChart = ({ optimizationData, products }: SolutionBarChartProps) => {
  const graphData = () => {
    return Object.values(optimizationData.products).map((productResult: ProductResult) => {
      return {
        name: products[productResult.id].title,
        sacks: productResult.value,
      }
    })
  }

  return (
    <BarChart width={400} height={300} data={graphData()} margin={{ top: 15, right: 15 }} barSize={10}>
      <XAxis
        dataKey="name"
        scale="point"
        padding={{ left: 50, right: 50 }}
        height={80}
        interval={0}
        tick={
          <CustomizedAxisTick
            x={0}
            y={0}
            payload={{
              value: 0,
            }}
          />
        }
      />
      <YAxis />
      <Tooltip />
      <Legend />
      <CartesianGrid strokeDasharray="3 3" />
      <Bar dataKey="sacks" fill="#73B1B5" label={{ position: 'top' }} />
    </BarChart>
  )
}
export default SolutionBarChart
