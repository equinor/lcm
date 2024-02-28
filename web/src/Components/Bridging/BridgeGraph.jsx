import React, { useContext, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { ParticleSizeContext } from "../../Context"
import styled from 'styled-components'
import { findGraphData } from '../../Utils'

const colors = [
  '#000000',
  '#ee2e89',
  '#21d0bb',
  '#2077d9',
  '#a1022f',
  '#2bcb95',
  '#64b3ec',
  '#ef7895',
  '#02953d',
  '#044f78',
]


const TooltipCard = styled.div`
  background: white;
  border-style: solid;
  border-color: silver;
  border-width: 0.1px;
  padding-left: 15px;
  padding-right: 20px;
  padding-bottom: 5px;
`


const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const numMicrons = Math.round(payload[0].payload.size)
    return (
      <TooltipCard >
        <p style={{ fontWeight: "500", marginLeft: '5px' }}> {numMicrons <= 1 ? 'Micron: ' : 'Microns: '} {numMicrons}</p>
        {payload.map((payloadData) => {
          return <p key={payloadData.name} style={{ color: payloadData.stroke, padding: '0px', margin: '5px' }}>{payloadData.name}: {Math.round(payloadData.value)}</p>
        })}
      </TooltipCard>
    );
  }

  return null;
}

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
    let index = sizeFractions.findIndex(size => size > offsetSize)
    if (index === -1) return ""
    let percentage = (index / sizeFractions.length) * 100
    return `${parseInt(percentage)}%`
  }

  useEffect(() => {
    let newGraphData = findGraphData(sizeFractions, bridges)
    setGraphData(newGraphData)
  }, [bridges, sizeFractions])

  return (
    <div>
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
        <Tooltip content={<CustomTooltip />} />
        <Legend  verticalAlign='middle' align='right' width={150}/>
        {Object.entries(bridges).map(([name, cumulative], index) => (
          <Area
            type="monotone"
            dataKey={name}
            stroke={colors[index % colors.length]}
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
