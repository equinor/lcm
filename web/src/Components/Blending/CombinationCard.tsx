import React, { useEffect, useState } from 'react'
// @ts-ignore
import { Button, Icon, TextField } from '@equinor/eds-core-react'
import CombinationTable from './CombinationTable'
import { Combination } from '../CombinationsWrapper'
import styled from 'styled-components'
import { Card } from './CardContainer'

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

interface CombinationCardProps {
  sacks: boolean
  combination: Combination
  updateCombination: Function
  renameCombination: Function
  removeCombination: Function
  products: any
  enabledProducts: any
}

export const CombinationCard = ({
  sacks,
  products,
  enabledProducts,
  combination,
  updateCombination,
  renameCombination,
  removeCombination,
}: CombinationCardProps) => {
  const [combinationName, setCombinationName] = useState<string>(combination.name)
  const [totalMass, setTotalMass] = useState<number>(0)

  useEffect(() => {
    let tempMass = 0
    Object.values(combination.values).forEach(prod => {
      tempMass += products[prod.id].sack_size * prod.value
    })
    setTotalMass(tempMass)
  }, [combination])

  return (
    <Card>
      <CardHeader>
        <TextField
          id={`${combination.name}`}
          value={combinationName}
          style={{ background: 'transparent', paddingTop: '10px' }}
          onChange={(event: any) => {
            setCombinationName(event.target.value)
          }}
          onBlur={() => {
            renameCombination(combinationName, combination.name)
          }}
          onKeyPress={(event: any) => {
            if (event.key === 'Enter') {
              // @ts-ignore
              document.activeElement.blur()
            }
          }}
        />
        <Button variant="ghost_icon" color="danger" onClick={() => removeCombination(combination.name)}>
          <Icon name="close" title="close" />
        </Button>
      </CardHeader>
      <CombinationTable
        sacks={sacks}
        products={products}
        enabledProducts={enabledProducts}
        updateCombination={updateCombination}
        productsInCombination={combination.values}
        combinationName={combinationName}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 5px', borderTop: '1px solid' }}>
        <div>Total mass</div>
        <div>{totalMass}kg</div>
      </div>
    </Card>
  )
}

export default CombinationCard
