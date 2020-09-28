import React, { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'

const colors = [
  "#000000",
  "#ee2e89",
  "#21d0bb",
  "#2077d9",
  "#a1022f",
  "#2bcb95",
  "#64b3ec",
  "#ef7895",
  "#02953d",
  "#044f78"]

export function BridgeGraph({ bridgeAndCombinations, sizeFractions }) {
  const [graphData, setGraphData] = useState([])

  useEffect(() => {
    let newGraphData = []
    sizeFractions.map((fraction, sizeIndex) => {
      let temp = {}
      temp.size = fraction
      bridgeAndCombinations.map((combination, combinationIndex) => {
        if (combination.cumulative && combination.cumulative.length === sizeFractions.length) {
          temp[combinationIndex] = combination.cumulative[sizeIndex + 1]
        }
      })
      newGraphData.push(temp)
    })
    setGraphData(newGraphData)

  }, [bridgeAndCombinations, sizeFractions])

  return <AreaChart
      data={graphData}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      width={750}
      height={420}
  >
    <CartesianGrid strokeDasharray="3 3"/>
    <XAxis dataKey="size" scale="log" domain={[0.1, 10000]} type="number" ticks={[0.1, 1, 10, 100, 1000, 10000]}
           allowDataOverflow/>
    <YAxis type="number" domain={[0, 100]} ticks={[20, 40, 60, 80, 100]} allowDataOverflow/>
    < Tooltip/>
    <Legend/>

    {bridgeAndCombinations.map((combination, index) =>
        <Area type="monotone" dataKey={index} stroke={colors[index % colors.length]} key={index}
              fill="transparent" name={combination.name} strokeWidth={1.5}/>)
    }
  </AreaChart>
}

export default BridgeGraph