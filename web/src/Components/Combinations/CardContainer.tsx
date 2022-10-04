import React, { useContext, useEffect, useState } from 'react'
// @ts-ignore
import styled from 'styled-components'
import CombinationCard from './CombinationCard'
// @ts-ignore
import { Button } from '@equinor/eds-core-react'
import { Bridge, Combinations } from '../../Types'
import Icon from '../../Icons'
import { FractionsAPI } from '../../Api'
import { AuthContext } from '../../Context'
import { ErrorToast } from '../Common/Toast'
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
  removeBridge: Function
  bridges: Bridge
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
  removeBridge,
  bridges,
}: CardContainerProps) => {
  const apiToken: string = useContext(AuthContext).token
  const [sizeFractions, setSizeFractions] = useState<number[]>([])

  // Load size fractions once on first render
  useEffect(() => {
    FractionsAPI.getFractionsApi(apiToken)
      .then(response => {
        setSizeFractions(response.data.size_fractions)
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
      })
  }, [])

  return (
    <>
      <div style={{ width: '100%', display: 'flex' }}>
        {Object.keys(combinations).map(id => {
          if (sacks === combinations[id].sacks && sizeFractions.length > 0)
            return (
              <CombinationCard
                key={combinations[id].name}
                sacks={sacks}
                combination={combinations[id]}
                removeCombination={removeCombination}
                allProducts={products}
                updateCombination={updateCombination}
                renameCombination={renameCombination}
                removeBridge={removeBridge}
                enabledPlot={Object.keys(bridges).includes(id)}
                sizeFractions={sizeFractions}
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
        >
          <Icon name='add_box' title='add_box' />
          Add combination
        </Button>
      </div>
    </>
  )
}

export default CardContainer
