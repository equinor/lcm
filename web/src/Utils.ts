import { Bridge, GraphData, Product } from './Types'

export function sortProducts(products: Array<Product>): Array<Product> {
  return products.sort((a, b) => {
    if (a.supplier > b.supplier) {
      return 1
    } else if (a.supplier === b.supplier) {
      if (a.id > b.id) {
        return 1
      } else return -1
    } else return -1
  })
}

export function findGraphData(sizeFractions: number[], bridges: Bridge): GraphData[] {
  let newGraphData: GraphData[] = []
  sizeFractions.forEach((fraction, sizeIndex) => {
    let temp: GraphData = { size: fraction }
    Object.entries(bridges).forEach(([name, cumulative]) => {
      temp[name] = cumulative[sizeIndex + 1]
    })
    newGraphData.push(temp)
  })
  return newGraphData
}


export function findDValue(graphData: GraphData[], goalYValue: number, bridgeName: string): number {
  //A D value is defined as a bridge graph's x-value at a specific y value
  //example: D90 (goalYValue = 90) is the bridge graph's x-value at at y = 90

  let bridgeYValues: number[] = []
  graphData.map(graph => bridgeYValues.push(graph[bridgeName]))

  // find the bridge's y-value that is closest to the goal y-value
  var closestToGoalYvalue = bridgeYValues.reduce(function (prev: number, curr: number) {
    return (Math.abs(curr - goalYValue) < Math.abs(prev - goalYValue) ? curr : prev);
  });

  let indexOfClosestYValue = bridgeYValues.indexOf(closestToGoalYvalue)
  let DValue = graphData[indexOfClosestYValue].size  //size contains the bridge's x-value

  return DValue
}

