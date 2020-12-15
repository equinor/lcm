import React from 'react'
// @ts-ignore
import styled from 'styled-components'
import CombinationCard from './CombinationCard'
// @ts-ignore
import { Button } from '@equinor/eds-core-react'
import { Combinations } from '../../Types'
import Icon from '../../Icons'

export const Card = styled.div`
  margin: 10px;
  padding: 10px;
  background-color: white;
  border: #cccccc solid 1px;
  border-radius: 5px;
  min-width: fit-content;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  resetCombinations: Function
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
  resetCombinations,
}: CardContainerProps) => {
  return (
    <>
      <div style={{ width: '100%', display: 'flex' }}>
        {Object.keys(combinations).map(id => {
          if (sacks === combinations[id].sacks)
            return (
              <CombinationCard
                key={combinations[id].name}
                sacks={sacks}
                combination={combinations[id]}
                removeCombination={removeCombination}
                allProducts={products}
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
          }}>
          <Icon name='add_box' title='add_box' />
          Add combination
        </Button>
        <Button style={{ marginLeft: '20px' }} onClick={() => resetCombinations(sacks)} color='danger' variant='ghost'>
          Remove combinations
        </Button>
      </div>
    </>
  )
}

export default CardContainer
