import React from 'react'
// @ts-ignore
import styled from 'styled-components'
import ProductCard from './ProductCard.js'
import CombinationCard from './CombinationCard'
// @ts-ignore
import { Button, LinearProgress } from '@equinor/eds-core-react'
import { Combination, Combinations, ProductsInCombination } from '../CombinationsWrapper'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
const Wrapper = styled.div`
  margin: 32px;
  display: grid;
  grid-gap: 32px;
  grid-template-columns: repeat(4, fit-content(100%));
`

interface CardContainerProps {
  sacks: any
  products: any
  combinations: Combinations
  setCombinations: Function
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
  setCombinations,
  enabledProducts,
  loading,
}: CardContainerProps) => {
  const addCombination = (name: string, sacks: boolean) => {
    const combination: Combination = {
      id: uuidv4(),
      name: name,
      sacks: sacks,
      values: {},
      cumulative: null,
    }
    setCombinations({ ...combinations, [combination.id]: combination })
  }

  const updateCombination = (combinationId: string, products: ProductsInCombination) => {
    let combination: Combination = combinations[combinationId]
    combination.values = products
    setCombinations({ ...combinations, [combinationId]: combination })
  }

  const removeCombination = (combinationId: string) => {
    let newCombinations: Combinations = {}
    Object.entries(combinations).forEach(([id, combination]) => {
      if (id !== combinationId) newCombinations[id] = combination
    })
    setCombinations(newCombinations)
  }

  const updateCombinationName = (combinationId: string, name: string) => {
    Object.entries(combinations).forEach(([id, combination]) => {
      if (combination.name === name) {
        alert('Name of combination already taken. Please select another one')
        return
      }
    })

    let combination: Combination = combinations[combinationId]
    if (combination) {
      combination.name = name
      setCombinations({ ...combinations, [combination.id]: combination })
    }
  }

  return (
    <div>
      {loading && <LinearProgress />}
      <div style={{ width: '100%', display: 'flex' }}>
        <ProductCard products={products} enabledProducts={enabledProducts} />

        {Object.keys(combinations).map(id => {
          if (sacks === combinations[id].sacks)
            return (
              <CombinationCard
                key={combinations[id].id}
                sacks={sacks}
                combination={combinations[id]}
                removeCombination={removeCombination}
                products={products}
                enabledProducts={enabledProducts}
                updateCombination={updateCombination}
                updateCombinationName={updateCombinationName}
              />
            )
          return null
        })}
      </div>
      <Wrapper>
        <Button
          onClick={() => {
            addCombination(createCombinationName(sacks, combinations), sacks)
          }}>
          Add combination
        </Button>
      </Wrapper>
    </div>
  )
}

export default CardContainer
