import React, { PureComponent } from 'react'
import styled from 'styled-components'
import { Card, Typography, Icon } from '@equinor/eds-core-react'
import { more_verticle, share, person_add, settings } from '@equinor/eds-icons'
import SolutionBarChart from './SolutionBarChart.js'
import SolutionRadarChart from './SolutionRadarChart.js'

const icons = {
  more_verticle,
  share,
  person_add,
  settings,
}

Icon.add(icons)

const Grid = styled.div`
  height: auto;
  width: fit-content;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 300px);
  grid-gap: 20px 100px;
  align-items: center;
`

export default class SolutionVisualisations extends PureComponent {

  constructor() {
    super()
  }
    
  render() {

  return (
        <Card variant="info" style={{ width: 'fit-content'}}>
            <Grid>
            <Typography variant="h6">Optimal blend</Typography>
            <Typography variant="h6">Scores</Typography>
            <SolutionBarChart optimizationData={this.props.optimizationData} products={this.props.products} fetched={this.props.fetched} loading={this.props.loading}/>
            <SolutionRadarChart optimizationData={this.props.optimizationData} fetched={this.props.fetched} loading={this.props.loading}/>
            </Grid>
        </Card>
    )
}
}