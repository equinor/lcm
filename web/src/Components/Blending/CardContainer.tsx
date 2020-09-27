import React from 'react'
// @ts-ignore
import styled from 'styled-components'
import ProductCard from "./ProductCard.js"
import CombinationCard from "./CombinationCard"
// @ts-ignore
import { Button, LinearProgress } from '@equinor/eds-core-react'
import { Product } from "../../gen-api/src/models"

const Wrapper = styled.div`
  margin: 32px;
  display: grid;
  grid-gap: 32px;
  grid-template-columns: repeat(4, fit-content(100%));
`

interface CardContainerProps {
  sacks: any
  products: any
  combinationMap: any
  enabledProducts: any
  updateCombination: any
  removeCombination: any
  updateCombinationName: any
  addCombination: any
  loading: any
}

const createCombinationName = (sacks: any, combinationMap: any) => {
  let combinationNames: Array<string> = []
    // TODO: Get rid of Map everywhere
    combinationMap.forEach((combination: any) => {
      combinationNames.push(combination.name)})

  let i: number = 1
  while (i < 100) {
    const newCombinationName: string = sacks ? ("Sack combination " + i) : ("Manual combination " + i)
    if (!combinationNames.includes(newCombinationName)) {
      return newCombinationName
    }
    i++
  }
  console.error("Failed to create a new combination name")
}

export const CardContainer = ({
                                sacks, products, combinationMap, enabledProducts, updateCombination,
                                removeCombination, updateCombinationName, addCombination, loading,
                              }: CardContainerProps) => {
  // TODO: Remove this flashing loading behaviour
  if (loading) return <LinearProgress/>


    const combinationList: Array<Product> = Array.from(combinationMap.values());

  return (
    <div>
      <div style={{ width: '100%' }}>
        <ProductCard products={products} enabledProducts={enabledProducts}/>
        {combinationList.map((combination: any) =>
          (combination.sacks === sacks) ? (
            <CombinationCard
              key={combination.id}
              sacks={sacks}
              combination={combination}
              removeCombination={removeCombination}
              products={products}
              enabledProducts={enabledProducts}
              updateCombination={updateCombination}
              updateCombinationName={updateCombinationName}/>
          ) : null,
        )}
      </div>

      <Wrapper>
        <Button onClick={() => {
          addCombination(createCombinationName(sacks, combinationMap), sacks)
        }}>Add combination</Button>
      </Wrapper>
    </div>
  )
}

export default CardContainer