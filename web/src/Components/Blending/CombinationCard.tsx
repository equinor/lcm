import React, { useState } from 'react'
// @ts-ignore
import { Button, Card, Icon, TextField } from '@equinor/eds-core-react'
import CombinationTable from './CombinationTable'

const { CardHeader, CardHeaderTitle } = Card

interface CombinationCardProps {
  sacks: any
  combination: any
  updateCombination: any
  updateCombinationName: any
  removeCombination: any
  products: any
  enabledProducts: any
}

export const CombinationCard = ({
  sacks,
  products,
  enabledProducts,
  combination,
  updateCombination,
  updateCombinationName,
  removeCombination,
}: CombinationCardProps) => {
  const [combinationName, setCombinationName] = useState<string>(combination.name)

  return (
    <Card style={{ width: 'fit-content', display: 'inline-block', margin: '10px', padding: '20px' }}>
      <CardHeader style={{ display: 'inline-flex', height: '50px' }}>
        <CardHeaderTitle>
          <TextField
            id={`${combination.id}`}
            value={combinationName}
            style={{ background: 'transparent' }}
            onChange={(event: any) => {
              setCombinationName(event.target.value)
            }}
            onBlur={() => {
              updateCombinationName(combination.id, combinationName)
            }}
            onKeyPress={(event: any) => {
              if (event.key === 'Enter') {
                // @ts-ignore
                document.activeElement.blur()
              }
            }}
          />
        </CardHeaderTitle>
        <Button variant="ghost_icon" color="danger" onClick={() => removeCombination(combination.id)}>
          <Icon name="close" title="close"></Icon>
        </Button>
      </CardHeader>
      <CombinationTable
        sacks={sacks}
        products={products}
        enabledProducts={enabledProducts}
        updateCombination={(products: any) => updateCombination(combination.id, products)}
        productsInCombination={combination.values}
      />
    </Card>
  )
}

export default CombinationCard
