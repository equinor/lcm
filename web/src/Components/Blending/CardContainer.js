import React from 'react'
import styled from 'styled-components'
import ProductCard from "./ProductCard.js"
import CombinationCard from "./CombinationCard.js"
import { Button } from '@equinor/eds-core-react'

const Wrapper = styled.div`
  margin: 32px;
  display: grid;
  grid-gap: 32px;
  grid-template-columns: repeat(4, fit-content(100%));
`

export default class CardContainer extends React.Component {
  constructor(props) {
    super(props);
    this.removeCard = this.removeCard.bind(this);
    this.updateCombination = this.updateCombination.bind(this)
  }

  updateCombination(combinationId, productId, value) {
    this.props.updateCombination(combinationId, productId, value)
  }

  removeCard(id) {
    this.props.removeCombination(id)
  }

  createCombinationName(sacks) {
    var n = 1
    var taken = true
    var next = false
    var currentName = ""
    while (taken) {
      next = false
      currentName = sacks ? ("Sack combination " + n) : ("Manual combination " + n)
      this.props.combinationMap.forEach((combination) => {
        if (combination.name === currentName) {
          n++
          next = true
        }
      })
      if (!next) {
        taken = false
      }
    }
    return currentName
  }
  
  render() { 
    return (
      <div>
      <div style={{width: '100%'}}>
        <ProductCard fetched={this.props.fetched} productMap={this.props.productMap} products={this.props.products}/>

        { (this.props.combinationMap.length !== 0) ? Array.from(this.props.combinationMap.values()).map((combination) =>
              (combination.sacks === this.props.sacks) ? (
                <CombinationCard id={combination.id} sacks={this.props.sacks} combination={combination} fetched={this.props.fetched} removeCard={this.removeCard} name={combination.name} productMap={this.props.productMap} products={this.props.products} updateCombination={this.updateCombination} updateCombinationName={this.props.updateCombinationName} />
              ) : ""
            ) : ""
          }
      </div>
        <Wrapper>
          <Button onClick={event => {this.props.addCombination(this.createCombinationName(this.props.sacks), this.props.sacks)}}>Add combination</Button>
        </Wrapper>
      </div>
    )}
}