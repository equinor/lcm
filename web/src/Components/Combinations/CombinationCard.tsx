import React, { useEffect, useState } from 'react'
// @ts-ignore
import { Button, Icon, TextField } from '@equinor/eds-core-react'
import CombinationTable from './CombinationTable'
import styled from 'styled-components'
import { Card } from './CardContainer'
import { Combination, Product, Products } from '../../Types'
import EditProducts from '../Common/EditProducts'

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
  allProducts: Products
}

export const CombinationCard = ({
  sacks,
  allProducts,
  combination,
  updateCombination,
  renameCombination,
  removeCombination,
}: CombinationCardProps) => {
  const [combinationName, setCombinationName] = useState<string>(combination.name)
  const [totalMass, setTotalMass] = useState<number>(0)
  const [enabledProducts, setEnabledProducts] = useState<Products>({})

  // On first render with products, set enabledProducts from saved combinations
  useEffect(() => {
    if (!(Object.keys(allProducts).length > 0)) return
    let newEnabledProducts: Products = {}
    Object.values(combination.values).forEach(prod => {
      newEnabledProducts = { ...newEnabledProducts, [prod.id]: allProducts[prod.id] }
    })
    setEnabledProducts(newEnabledProducts)
  }, [allProducts])

  // Calculate sum of mass in combination on combination change
  useEffect(() => {
    if (!(Object.keys(allProducts).length > 0)) return
    let newMass: number = 0
    Object.values(combination.values).forEach(prod => {
      newMass += allProducts[prod.id].sackSize * prod.value
    })
    setTotalMass(newMass)
  }, [combination, allProducts])

  // Update combination to only have selected products
  useEffect(() => {
    let newCombination: Combination = { ...combination }
    newCombination.values = {}
    Object.values(enabledProducts).forEach((p: Product) => {
      if (combination.values[p.id]) {
        newCombination.values[p.id] = combination.values[p.id]
      } else {
        newCombination.values[p.id] = { value: 0, percentage: 0, id: p.id }
      }
    })
    updateCombination(newCombination)
  }, [enabledProducts])

  return (
    <Card>
      <div>
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
          <Button variant='ghost_icon' color='danger' onClick={() => removeCombination(combination.name)}>
            <Icon name='close' title='close' />
          </Button>
        </CardHeader>
        {Object.keys(enabledProducts).length ? (
          <CombinationTable
            allProducts={allProducts}
            sacks={sacks}
            updateCombination={updateCombination}
            productsInCombination={combination.values}
            combinationName={combinationName}
          />
        ) : (
          <div style={{ padding: '20px' }}>No products selected</div>
        )}
      </div>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '3px 5px 15px 5px',
            borderTop: '1px solid',
          }}>
          <div>Total mass</div>
          <div>{totalMass}kg</div>
        </div>
        <EditProducts
          allProducts={allProducts}
          enabledProducts={enabledProducts}
          setEnabledProducts={setEnabledProducts}
        />
      </div>
    </Card>
  )
}

export default CombinationCard
