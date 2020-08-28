import React, { PureComponent } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

export default class SolutionRadarChart extends PureComponent {
  render() {
    if (this.props.fetched&&this.props.optimizationData&&this.props.optimizationData&&this.props.optimizationData.performance){
      const graphData = [
        { name: 'Fit', value: this.props.optimizationData.performance["best_fit"]},
        { name: 'Cost', value: this.props.optimizationData.performance["cost"]},
        { name: 'CO2', value: this.props.optimizationData.performance["co2"]},
        { name: 'Mass', value: this.props.optimizationData.performance["mass_fit"]},
        { name: 'Env.', value: this.props.optimizationData.performance["enviromental"]},
        ];
      return (
        <RadarChart cx={150} cy={150} outerRadius={100} width={300} height={300} data={graphData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar name="Mike" dataKey="value" stroke="#73B1B5" fill="#73B1B5" fillOpacity={0.6} />
        </RadarChart>
      );
    }
    else {
      return ("")
    }
  }    
}