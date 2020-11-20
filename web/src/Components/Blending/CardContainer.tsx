import React from 'react'
// @ts-ignore
import styled from 'styled-components'
import CombinationCard from './CombinationCard'
// @ts-ignore
import { Button } from '@equinor/eds-core-react'
import { Combinations } from '../CombinationsWrapper'
import ProductTable from './ProductTable'

export const Card = styled.div`
  margin: 10px;
  padding: 10px;
  background-color: white;
  border: #cccccc solid 1px;
  border-radius: 5px;
`
export const CombinationTableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  background-color: #f7f7f7;
  border-bottom: #bfbfbf 2px solid;
`
export const CombinationTableValues = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 10px;
  padding-right: 10px;
`

interface CardContainerProps {
  sacks: any
  products: any
  combinations: Combinations
  updateCombination: Function
  renameCombination: Function
  removeCombination: Function
  addCombination: Function
  enabledProducts: any
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
}: CardContainerProps) => {
  return (
    <>
      <div style={{ width: '100%', display: 'flex' }}>
        <Card>
          <ProductTable products={products} enabledProducts={enabledProducts} />
        </Card>
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
          variant='outlined'>
          Add combination
        </Button>
      </div>
    </>
  )
}

export default CardContainer
