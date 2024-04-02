import React, { useContext, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { ParticleSizeContext } from "../../Context"
import { findGraphData } from '../../Utils'
import { graphColors } from './styles'


export function BridgeGraph({ bridges, sizeFractions }) {
  const [graphData, setGraphData] = useState([])
  const [particleFromPercentage, setParticleFromPercentage] = useState("")
  const [particleToPercentage, setParticleToPercentage] = useState("")
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
    if (index === -1) return ""
    const percentage = Math.round(index / sizeFractions.length) * 100
    return `${percentage}%`
  }

  useEffect(() => {
    const newGraphData = findGraphData(sizeFractions, bridges)
    setGraphData(newGraphData)
  }, [bridges, sizeFractions])

  return (
    <div style={{backgroundColor: 'white', borderRadius: '0.5rem'}}>
      <AreaChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} width={980} height={420}>
        {/* Defines a gradient applied to the areaPlot to highlight selected particle size range*/}
        <defs>
          <linearGradient id="particleArea">
            <stop offset={particleFromPercentage} stopColor="transparent" />
            <stop offset={particleFromPercentage} stopColor="#E2DCDC" />
            <stop offset={particleToPercentage} stopColor="#E2DCDC" />
            <stop offset={particleToPercentage} stopColor="transparent" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="size"
          scale="log"
          domain={[0.1, 10000]}
          type="number"
          ticks={[0.1, 1, 10, 100, 1000, 10000]}
          label={{ value: 'microns', position: 'center', offset: 0 }}
          height={70}
        />
        <YAxis type="number" domain={[0, 100]} ticks={[20, 40, 60, 80, 100]} allowDataOverflow />
        <Tooltip />
        {/* <Legend  verticalAlign='middle' align='right' width={150}/> */}
        {Object.entries(bridges).map(([name, cumulative], index) => (
          <Area
            type="monotone"
            dataKey={name}
            stroke={graphColors[index % graphColors.length]}
            key={name}
            fill={(name === "Bridge" && "url(#particleArea)") || "transparent"}
            name={name}
            strokeWidth={1.5}
          />
        ))}
      </AreaChart>
    </div>
  )
}

export default BridgeGraph
