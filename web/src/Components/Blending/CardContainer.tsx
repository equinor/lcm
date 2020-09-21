import React from 'react'
import styled from 'styled-components'
import ProductCard from "./ProductCard.js"
import CombinationCard from "./CombinationCard"
// @ts-ignore
import {Button, LinearProgress} from '@equinor/eds-core-react'
import {Product} from "../../gen-api/src/models";

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
    var n = 1
    var taken = true
    var next = false
    var currentName = ""
    while (taken) {
        next = false
        currentName = sacks ? ("Sack combination " + n) : ("Manual combination " + n)
        combinationMap.forEach((combination: any) => {
            if (combination.name === currentName) {
                n++
                next = true
            }
        })
        if (!next) {
            taken = false
        }
    }
    return currentName
}

export const CardContainer = ({
                                  sacks, products, combinationMap, enabledProducts, updateCombination,
                                  removeCombination, updateCombinationName, addCombination, loading
                              }: CardContainerProps) => {

    if (loading) return <LinearProgress/>


    const combinationList: Array<Product> = Array.from(combinationMap.values());

    return (
        <div>
            <div style={{width: '100%'}}>
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
                    ) : null
                )}
            </div>

            <Wrapper>
                <Button onClick={(event: any) => {
                    addCombination(createCombinationName(sacks, combinationMap), sacks)
                }}>Add combination</Button>
            </Wrapper>
        </div>
    )
}

export default CardContainer