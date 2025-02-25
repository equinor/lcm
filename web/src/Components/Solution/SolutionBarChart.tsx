import { PureComponent } from 'react'
// @ts-ignore
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import type { OptimizationData, Products } from '../../Types'
import { ProductResult } from '../Optimization/OptimizationContainer'

class CustomizedAxisTick extends PureComponent {
  render() {
    const {
      // @ts-ignore
      x,
      // @ts-ignore
      y,
      // @ts-ignore
      payload,
    } = this.props

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
        tick={<CustomizedAxisTick />}
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
