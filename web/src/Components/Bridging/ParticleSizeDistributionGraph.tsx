import { useContext, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { ParticleSizeContext } from '../../Context'
import { findGraphData } from '../../Utils'
import { graphColors } from './styles'
import { differentiateArrayObjects } from './utils'
import BridgeGraph from './BridgeGraph'

export function ParticleSizeDistributionGraph({ bridges, sizeFractions }) {
  const [graphData, setGraphData] = useState([])
  const [particleFromPercentage, setParticleFromPercentage] = useState('')
  const [particleToPercentage, setParticleToPercentage] = useState('')
  const particleRange = useContext(ParticleSizeContext)

  useEffect(() => {
    setParticleFromPercentage(particleSizeOffsetPercentage(particleRange.from))
    if (particleRange.to > sizeFractions[sizeFractions.length - 1]) {
      setParticleToPercentage(sizeFractions[sizeFractions.length - 1])
    } else {
      setParticleToPercentage(particleSizeOffsetPercentage(particleRange.to))
    }
  }, [particleRange, sizeFractions])

  function particleSizeOffsetPercentage(offsetSize) {
    const index = sizeFractions.findIndex(size => size > offsetSize)
    if (index === -1) return ''
    const percentage = Math.round(index / sizeFractions.length) * 100
    return `${percentage}%`
  }

  useEffect(() => {
    const newGraphData = findGraphData(sizeFractions, bridges)
    const diffentiated = differentiateArrayObjects(newGraphData)
    setGraphData(diffentiated)
  }, [bridges, sizeFractions])

  return <BridgeGraph graphData={graphData} bridges={bridges} />
}

export default ParticleSizeDistributionGraph