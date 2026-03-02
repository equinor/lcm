import type { Bridge, GraphData } from '../types'

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
