import { useEffect, useState } from 'react'
import { findGraphData } from '../../Utils'
import { differentiateArrayObjects } from './utils'
import BridgeGraph from './BridgeGraph'

export function ParticleSizeDistributionGraph({ bridges, sizeFractions }) {
  const [graphData, setGraphData] = useState([])

  useEffect(() => {
    const newGraphData = findGraphData(sizeFractions, bridges)
    const diffentiated = differentiateArrayObjects(newGraphData)
    setGraphData(diffentiated)
  }, [bridges, sizeFractions])

  return <BridgeGraph graphData={graphData} sizeFractions={sizeFractions} bridges={bridges} />
}

export default ParticleSizeDistributionGraph
