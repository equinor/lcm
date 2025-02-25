// @ts-ignore
import { Button, Icon } from '@equinor/eds-core-react'
import { add } from '@equinor/eds-icons'
import { useContext, useEffect, useState } from 'react'
import { AuthContext, type IAuthContext } from 'react-oauth2-code-pkce'
// @ts-ignore
import styled from 'styled-components'
import { FractionsAPI } from '../../Api'
import type { Bridge, Combination, Combinations, Products } from '../../Types'
import { ErrorToast } from '../Common/Toast'
import CombinationCard from './CombinationCard'
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
  align-items: self-end;
  padding: 0px 10px;
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
  sacks: boolean
  products: Products
  combinations: Combinations
  updateCombination: (c: Combination) => void
  renameCombination: (id: string, name: string) => void
  removeCombination: (id: string) => void
  addCombination: (c: Combination) => void
  removeBridge: (id: string) => void
  bridges: Bridge
}

const createCombinationName = (sacks: boolean, combinationMap: Combinations): string => {
  const combinationNames: Array<string> = Object.keys(combinationMap).map((id) => combinationMap[id].name)

  let i = 1
  while (i < 100) {
    const newCombinationName: string = sacks ? `Sack combination ${i}` : `Manual combination ${i}`
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
  const { token }: IAuthContext = useContext(AuthContext)
  const [sizeFractions, setSizeFractions] = useState<number[]>([])

  // Load size fractions once on first render
  useEffect(() => {
    FractionsAPI.getFractionsApi(token)
      .then((response) => {
        setSizeFractions(response.data.size_fractions)
      })
      .catch((error) => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(`fetch error ${error}`)
      })
  }, [])

  return (
    <>
      <div style={{ width: '100%', display: 'flex' }}>
        {Object.keys(combinations).map((id) => {
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
              values: {},
              cumulative: null,
            })
          }}
        >
          <Icon data={add} title="add_box" />
          New combination
        </Button>
      </div>
    </>
  )
}

export default CardContainer
