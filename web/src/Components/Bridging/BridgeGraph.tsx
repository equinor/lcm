import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { graphColors } from './styles'

export function BridgeGraph({ graphData, bridges }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem' }}>
      <AreaChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} width={700} height={500}>
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
        <YAxis type='number' allowDataOverflow width={75} label={{ value: 'Cumulative Volume (%)', angle: '270' }} />
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
    </div>
  )
}

export default BridgeGraph
