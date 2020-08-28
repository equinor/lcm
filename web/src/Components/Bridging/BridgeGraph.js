import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

const colors = [
  "#000000",
  "#8D2C5A", 
  "#265F58",
  "#004088",
  "#E24974",
  "#43997C",
  "#2A84C4",
  "#F190A7",  
  "#62D490", 
  "#53C0FB"]

export function BridgeGraph({bridgeAndCombinations,sizeFractions}) {
  var combinationsData = [];
  const graphData = () => {
    var data = []
    var n = 0;
    if (bridgeAndCombinations&&bridgeAndCombinations.length !== 0) {
      bridgeAndCombinations.map((combination) => {
        var combData = {
          index: n,
          name: bridgeAndCombinations[n].name
        }
        combinationsData.push(combData)
        n+=1
      }
      )
      var i = 0
      sizeFractions.map((fraction) => {
        i+=1
        var temp = {}
        temp["size"] = fraction;
        var c = 0;
        bridgeAndCombinations.map((combination) => {
          if (combination.hasOwnProperty("cumulative") && combination.cumulative && combination.cumulative.length === sizeFractions.length){
            temp["cum"+c] = combination.cumulative[i] 
          }
          c+=1;
        }
        )
        data.push(temp);   
      }
      )
      return data
    } else {
      return null
    }
    
  }
  var visualData = graphData()
  return(
    <AreaChart
      data={visualData}
      margin={{
        top: 5, right: 30, left: 20, bottom: 5,
      }}
      width={750}
      height={420}
    >    
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="size" scale="log" domain={[0.1, 10000]} type="number" ticks={[0.1, 1, 10, 100, 1000, 10000]} allowDataOverflow />
        <YAxis type="number" domain={[0, 100]} ticks={[20, 40, 60, 80, 100]} allowDataOverflow />
        < Tooltip />
        <Legend />
        { (visualData&&visualData.length!==0) ? combinationsData.map((data) =>
            <Area type="monotone" dataKey={'cum' + data.index} stroke={colors[data.index%colors.length]} fill="transparent" name={data.name}  />
          ) : ""
        }
      </AreaChart>
  )
}
export default BridgeGraph