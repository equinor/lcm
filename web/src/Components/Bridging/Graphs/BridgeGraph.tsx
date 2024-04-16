import React, { useContext, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ParticleSizeContext } from '../../../Context'
import { bridgeColor, graphColors } from '../styles'
import { Bridge, GraphData } from '../../../Types'
import { Typography } from '@equinor/eds-core-react'

type BridgeGraphProps = {
  title: string
  graphData: GraphData[]
  sizeFractions: number[]
  bridges: Bridge | undefined
  showBridge?: boolean
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'white', border: '1px solid gray', padding: '5px', borderRadius: '2px' }}>
        <div style={{ opacity: '50%' }}>{`Particle size : ${label}µm`}</div>
        <div style={{ marginTop: '15px' }}>
          {payload.map((graphData: any, index: number) => (
            <div key={index} style={{ color: graphData.color }}>{`${graphData.name}: ${graphData.value}%`}</div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export function BridgeGraph({ title, graphData, sizeFractions, bridges, showBridge = true }: BridgeGraphProps) {
  const [particleFromPercentage, setParticleFromPercentage] = useState<string>('0%')
  const [particleToPercentage, setParticleToPercentage] = useState<string>('100%')
  const particleRange = useContext(ParticleSizeContext)

  useEffect(() => {
    setParticleFromPercentage(particleSizeOffsetPercentage(particleRange.from))
    if (particleRange.to > sizeFractions[sizeFractions.length - 1]) {
      setParticleToPercentage(`${sizeFractions[sizeFractions.length - 1]}%`)
    } else {
      setParticleToPercentage(particleSizeOffsetPercentage(particleRange.to))
    }
  }, [particleRange, sizeFractions])

  function particleSizeOffsetPercentage(offsetSize: number) {
    const index = sizeFractions.findIndex(size => size > offsetSize)
    if (index === -1) return '0%'
    let percentage = (index / sizeFractions.length) * 100
    return `${percentage}%`
  }
  const legendHeight = Math.max(Math.round(Object.entries(bridges).length / 3) * 20, 30)

  if (!showBridge) {
    const { Bridge, ...withoutBridge } = bridges
    bridges = withoutBridge
  }
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', width: '100%', height: '100%' }}>
      <Typography variant='h4' style={{ textAlign: 'center' }}>
        {title}
      </Typography>
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
          <YAxis type='number' allowDataOverflow width={75} label={{ value: 'Volume (%)', angle: '270' }} />
          <Tooltip content={CustomTooltip} />
          <Legend verticalAlign='bottom' align='center' height={legendHeight} />
          {Object.entries(bridges).map(([name, cumulative], index) => (
            <Area
              type='monotone'
              dataKey={name}
              stroke={
                name === 'Bridge' ? bridgeColor : graphColors[(index - (showBridge ? 1 : 0)) % graphColors.length]
              }
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
