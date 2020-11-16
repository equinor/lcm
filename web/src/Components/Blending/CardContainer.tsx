import React from 'react'
// @ts-ignore
import styled from 'styled-components'
import ProductCard from './ProductCard.js'
import CombinationCard from './CombinationCard'
// @ts-ignore
import { Button, LinearProgress } from '@equinor/eds-core-react'
import { Combinations } from '../CombinationsWrapper'

interface CardContainerProps {
  sacks: any
  products: any
  combinations: Combinations
  updateCombination: Function
  renameCombination: Function
  removeCombination: Function
  addCombination: Function
  enabledProducts: any
  loading: any
}

const createCombinationName = (sacks: any, combinationMap: Combinations): string => {
  let combinationNames: Array<string> = Object.keys(combinationMap).map(id => combinationMap[id].name)

  let i: number = 1
  while (i < 100) {
    const newCombinationName: string = sacks ? 'Sack combination ' + i : 'Manual combination ' + i
    if (!combinationNames.includes(newCombinationName)) {
      return newCombinationName
    }
    i++
  }
  console.error('Failed to create a new combination name')
  return 'Error name....'
}

export const CardContainer = ({
  sacks,
  products,
  combinations,
  updateCombination,
  renameCombination,
  removeCombination,
  addCombination,
  enabledProducts,
  loading,
}: CardContainerProps) => {
  return (
    <div>
      {loading && <LinearProgress />}
      <div style={{ width: '100%', display: 'flex' }}>
        <ProductCard products={products} enabledProducts={enabledProducts} />

        {Object.keys(combinations).map(id => {
          if (sacks === combinations[id].sacks)
            return (
              <CombinationCard
                key={combinations[id].name}
                sacks={sacks}
                combination={combinations[id]}
                removeCombination={removeCombination}
                products={products}
                enabledProducts={enabledProducts}
                updateCombination={updateCombination}
                renameCombination={renameCombination}
              />
            )
          return null
        })}
      </div>
      <div style={{ padding: '15px' }}>
        <Button
          onClick={() => {
            addCombination({
              name: createCombinationName(sacks, combinations),
              sacks: sacks,
              values: [],
              cumulative: null,
            })
          }}
          variant="outlined">
          Add combination
        </Button>
      </div>
    </div>
  )
}

export default CardContainer
