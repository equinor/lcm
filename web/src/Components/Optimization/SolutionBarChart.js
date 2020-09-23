import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class CustomizedAxisTick extends PureComponent {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={8} textAnchor="end" fill="#666" transform="rotate(-60)">{payload.value}</text>
      </g>
    );
  }
}

export default class SolutionBarChart extends PureComponent {

  render() {

    const graphData = () => {
      var data = []
      if (this.props.fetched && this.props.optimizationData && this.props.optimizationData.products && this.props.optimizationData.products.length !== 0) 
       {
         this.props.optimizationData.products.map((product) => {
                var object = {}
                object.name = (this.props.products.get(product.id)).name
                object.sacks = product.sacks
                data.push(object)     
         }
         )
       }       
      return data
      }

    return (
      <BarChart
        width={300}
        height={250}
        data={graphData()}
        margin={{top: 15, right: 15}}
        barSize={10}
      >
        <XAxis dataKey="name" scale="point" padding={{ left: 50, right: 50 }} height={80} interval={0} tick={<CustomizedAxisTick />}/>
        <YAxis /> 
        <Tooltip />
        <Legend />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="sacks" fill="#73B1B5" background={{ fill: '#D6EAF4' }} label={{ position: 'top' }} />
      </BarChart>
    );
  }
}