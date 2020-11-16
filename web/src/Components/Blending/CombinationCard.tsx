import React, { useState } from 'react'
// @ts-ignore
import { Button, Card, Icon, TextField } from '@equinor/eds-core-react'
import CombinationTable from './CombinationTable'
import { Combination } from '../CombinationsWrapper'

const { CardHeader, CardHeaderTitle } = Card

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

  return (
    <Card style={{ width: 'fit-content', display: 'inline-block', margin: '10px', padding: '20px' }}>
      <CardHeader style={{ display: 'inline-flex', height: '50px' }}>
        <CardHeaderTitle>
          <TextField
            id={`${combination.name}`}
            value={combinationName}
            style={{ background: 'transparent' }}
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
        </CardHeaderTitle>
        <Button variant="ghost_icon" color="danger" onClick={() => removeCombination(combination.name)}>
          <Icon name="close" title="close"></Icon>
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
    </Card>
  )
}

export default CombinationCard
