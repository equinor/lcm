import type { Bridge, GraphData, Product } from './Types'

export function sortProducts(products: Array<Product>): Array<Product> {
  return products.sort((a, b) => {
    if (a.supplier > b.supplier) {
      return 1
    }
    if (a.supplier === b.supplier) {
      if (a.id > b.id) {
        return 1
      }
      return -1
    }
    return -1
  })
}

export function findGraphData(sizeFractions: number[], bridges: Bridge): GraphData[] {
  const newGraphData: GraphData[] = []
  sizeFractions.forEach((fraction, sizeIndex) => {
    const temp: GraphData = { size: fraction }
    Object.entries(bridges).forEach(([name, cumulative]) => {
      temp[name] = cumulative[sizeIndex]
    })
    newGraphData.push(temp)
  })
  return newGraphData
}

function linearInterpolation(yMin: number, yMax: number, xMin: number, xMax: number, targetY: number): number {
  const increase = (yMax - yMin) / (xMax - xMin)
  return Number((increase * (targetY - xMin) + yMin).toFixed(1))
}

export function findDValue(graphData: GraphData[], goalYValue: number, bridgeName: string): number {
  // A D value is defined as a bridge graph's x-value at a specific y value
  // Example: D90 (goalYValue = 90) is the bridge graph's x-value at y = 90

  const bridgeYValues: number[] = []
  graphData.map((graph) => bridgeYValues.push(graph[bridgeName]))

  // find the bridge's y-value that is closest to the goal y-value
  let indexOfClosestHigherYValue = 0
  bridgeYValues.some((accumulativePercentage, index) => {
    if (accumulativePercentage > goalYValue) {
      indexOfClosestHigherYValue = index
      return true
    }
    return false
  })
  if (!indexOfClosestHigherYValue) {
    return -1
  }

  // interpolate the values to get an approx value for the exact D requested
  return linearInterpolation(
    graphData[indexOfClosestHigherYValue - 1].size,
    graphData[indexOfClosestHigherYValue].size,
    bridgeYValues[indexOfClosestHigherYValue - 1],
    bridgeYValues[indexOfClosestHigherYValue],
    goalYValue
  )
}
