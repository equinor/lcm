import React, { useContext, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ParticleSizeContext } from '../../../Context'
import { findGraphData } from '../../../Utils'
import { graphColors } from '../styles'
import { Bridge, GraphData } from '../../../Types'

type BridgeGraphProps = {
  yAxis: string
  graphData: GraphData[]
  sizeFractions: number[]
  bridges: Bridge
}

export function BridgeGraph({ yAxis, graphData, sizeFractions, bridges }: BridgeGraphProps) {
  const [particleFromPercentage, setParticleFromPercentage] = useState<string>('')
  const [particleToPercentage, setParticleToPercentage] = useState<string>('')
  const particleRange = useContext(ParticleSizeContext)

  useEffect(() => {
    setParticleFromPercentage(particleSizeOffsetPercentage(particleRange.from))
    if (particleRange.to > sizeFractions[sizeFractions.length - 1]) {
      setParticleToPercentage(`${sizeFractions[sizeFractions.length - 1]}`)
    } else {
      setParticleToPercentage(particleSizeOffsetPercentage(particleRange.to))
    }
  }, [particleRange, sizeFractions])

  function particleSizeOffsetPercentage(offsetSize: number) {
    const index = sizeFractions.findIndex(size => size > offsetSize)
    if (index === -1) return ''
    const percentage = Math.round(index / sizeFractions.length) * 100
    return `${percentage}%`
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', width: '100%', height: '100%' }}>
      <ResponsiveContainer height={500} minWidth={600}>
        <AreaChart data={graphData} margin={{ top: 5, right: 30, bottom: 5 }}>
          {/* Defines a gradient applied to the areaPlot to highlight selected particle size range*/}
          <defs>
            <linearGradient id='particleArea'>
              <stop offset={particleFromPercentage} stopColor='transparent' />
              <stop offset={particleFromPercentage} stopColor='#E2DCDC' />
              <stop offset={particleToPercentage} stopColor='#E2DCDC' />
              <stop offset={particleToPercentage} stopColor='transparent' />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='size'
            scale='log'
            domain={[0.1, 10000]}
            type='number'
            ticks={[0.1, 1, 10, 100, 1000, 10000]}
            label={{ value: 'particle size (\u00B5m)', position: 'center', offset: 0 }}
            height={70}
          />
          <YAxis type='number' allowDataOverflow width={75} label={{ value: yAxis, angle: '270' }} />
          <Tooltip />
          <Legend verticalAlign='bottom' align='center' />
          {Object.entries(bridges).map(([name, cumulative], index) => (
            <Area
              type='monotone'
              dataKey={name}
              stroke={graphColors[index % graphColors.length]}
              key={name}
              fill={(name === 'Bridge' && 'url(#particleArea)') || 'transparent'}
              name={name}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BridgeGraph
