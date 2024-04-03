import React, { useContext, useEffect, useState } from 'react'
import { ParticleSizeContext } from '../../../Context'
import { findGraphData } from '../../../Utils'
import BridgeGraph from './BridgeGraph'

export function CumulativeGraph({ bridges, sizeFractions }) {
  const [graphData, setGraphData] = useState([])

  useEffect(() => {
    const newGraphData = findGraphData(sizeFractions, bridges)
    setGraphData(newGraphData)
  }, [bridges, sizeFractions])

  return (
    <BridgeGraph
      graphData={graphData}
      bridges={bridges}
      sizeFractions={sizeFractions}
      yAxis={'Cumulative Volume (%)'}
    />
  )
}

export default CumulativeGraph
