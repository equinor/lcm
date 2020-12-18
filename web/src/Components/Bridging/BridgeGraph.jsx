import React, { useContext, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { ParticleSizeContext } from "../../Context"

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

export function BridgeGraph({ bridges, sizeFractions }) {
  const [graphData, setGraphData] = useState([])
  const [particleFromPercentage, setParticleFromPercentage] = useState("")
  const [particleToPercentage, setParticleToPercentage] = useState("")
  const particleRange = useContext(ParticleSizeContext)

  useEffect(()=>{
    setParticleFromPercentage(particleSizeOffsetPercentage(particleRange.from))
    if(particleRange.to > sizeFractions[sizeFractions.length-1]){
      setParticleToPercentage(sizeFractions[sizeFractions.length - 1])
    } else{
      setParticleToPercentage(particleSizeOffsetPercentage(particleRange.to))
    }
  },[particleRange, sizeFractions])

  function particleSizeOffsetPercentage(offsetSize){
    let index = sizeFractions.findIndex(size => size > offsetSize)
    if(index === -1) return ""
    let percentage = (index / sizeFractions.length) * 100
    return `${parseInt(percentage)}%`
  }

  useEffect(() => {
    let newGraphData = []

    sizeFractions.forEach((fraction, sizeIndex) => {
      let temp = {}
      temp.size = fraction
      Object.entries(bridges).forEach(([name, cumulative]) => (
          temp[name] = cumulative[sizeIndex + 1]
      ))
      newGraphData.push(temp)
    })
    setGraphData(newGraphData)
  }, [bridges, sizeFractions])

  return (
      <div style={{paddingLeft: '5%'}}>
        <AreaChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} width={750} height={420}>
        {/* Defines a gradient applied to the areaPlot to highlight selected particle size range*/}
        <defs>
          <linearGradient id="particleArea">
            <stop offset={particleFromPercentage}  stopColor="transparent" />
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
        />
        <YAxis type="number" domain={[0, 100]} ticks={[20, 40, 60, 80, 100]} allowDataOverflow />
        <Tooltip />
        <Legend />
        {Object.entries(bridges).map(([name, cumulative], index) => (
            <Area
            type="monotone"
            dataKey={name}
            stroke={colors[index % colors.length]}
            key={name}
            fill={(name === "Bridge" && "url(#particleArea)") ||"transparent"}
            name={name}
            strokeWidth={1.5}
          />
        ))}
    </AreaChart>
      </div>
  )
}

export default BridgeGraph
