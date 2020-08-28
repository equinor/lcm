import React from 'react'
import { Card, Button, Icon, TextField } from '@equinor/eds-core-react'
import CombinationTable from './CombinationTable.js'
import { close } from '@equinor/eds-icons'

const icons = { close }

Icon.add(icons)

const { CardHeader, CardHeaderTitle } = Card


export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.updateCombination = this.updateCombination.bind(this)
  }

  updateCombination(productId, value) {
    this.props.updateCombination(this.props.id, productId, value)
  }

  updateCombinationName(event) {
    this.props.updateCombinationName(this.props.combination.id, event.target.value)
  }

  render() {
    return (
      <Card style={{ width: 'fit-content', display: 'inline-block', margin: "10px", padding: "20px" }}>
        <CardHeader style={{ display: 'inline-flex', height: '50px' }}>
          <CardHeaderTitle>
            <TextField
              value={this.props.combination.name}
              style={{ background: "transparent" }}
              onChange={(event)=>
                this.updateCombinationName(event)}
            />
          </CardHeaderTitle>
          <Button 
            variant="ghost_icon" 
            color="danger" 
            onClick={(event) => 
              this.props.removeCard(this.props.combination.id)}>
            <Icon name="close" title="close" ></Icon>
          </Button>
        </CardHeader>
        <CombinationTable 
          id={this.props.id} 
          sacks={this.props.sacks} 
          fetched={this.props.fetched} 
          productMap={this.props.productMap} 
          products={this.props.products} 
          name={this.props.name} 
          combination={this.props.combination} 
          updateCombination={this.updateCombination} />
      </Card>
    )
  }
}