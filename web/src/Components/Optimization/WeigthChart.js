import React, { PureComponent } from 'react';
import styled from 'styled-components'
import { PieChart, Pie, Cell, Legend } from 'recharts';

const Wrapper = styled.div`
  height: 'fit-content';
  width: 'fit-content';
`

const COLORS = ['#73B1B5', '#A8CFD2', '#CAE0E2', '#DEEDEE'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index,
}) => {
   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#3D3D3D" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export class WeigthChart extends PureComponent {

  render() {
      const data = [
        { name: 'Fit', value: this.props.fitValue },
        { name: 'Cost', value: this.props.costValue },
        { name: 'CO2', value: this.props.CO2Value },
        { name: 'Mass', value: this.props.massValue },
        ];
    
    return (
    <Wrapper>
      <PieChart width={260} height={180}>
        <Pie
          data={data}
          cx={70}
          cy={90}
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={75}
          fill="#8884d8"
          dataKey="value"
        >
          {
            data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
          }
        </Pie>
        <Legend layout="vertical" align="right" verticalAlign="middle"/>
      </PieChart>
      </Wrapper> 
    );
  }
}

export default WeigthChart