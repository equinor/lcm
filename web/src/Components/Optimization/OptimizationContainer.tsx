import React, {PureComponent, ReactElement, useState} from "react";
import styled from "styled-components";
import SolutionData from "./SolutionData.js";
import SolutionVisualisations from "./SolutionVisualisations.js";
import {Combination} from "../../Pages/Main";
import {Product} from "../../gen-api/src/models";
import OptimizationRunner from "./OptimizationRunner";
import OptimizationResult from "./OptimizationResult";


const WrapperOptimizer = styled.div`
  padding-top: 4rem;
`;


const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 260px);
  grid-gap: 32px 32px;
`;


interface OptimizationContainerProps {
    products: Map<string, Product>
    enabledProducts: Array<string>
    combinationMap: Map<string, Combination>
    mode: string
    value: number
    addCombination: Function
}


export const OptimizationContainer = ({products, enabledProducts, combinationMap, mode, value, addCombination}: OptimizationContainerProps): ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [optimizationData, setOptimizationData] = useState(null)



    const handleUpdate = (optimizationData: any) => {
        setOptimizationData(optimizationData)

        // Add the optimized solution to sack combinations
        let tempValues = new Map()
        // @ts-ignore
        let productsInResult = optimizationData.products
        // Find total mass sum
        let massSum = 0
        if (productsInResult.length !== 0) {
            productsInResult.map((component: any) => {
                // @ts-ignore
                massSum += component.sacks * products[component.id].sackSize
            })
            productsInResult.map((component: any) => {
                if (component.sacks !== 0) {
                    let tempValue = {}
                    // @ts-ignore
                    tempValue.id = component.id
                    // @ts-ignore
                    tempValue.value = component.sacks
                    // @ts-ignore
                    tempValue.percentage = 100 * ((component.sacks * products[component.id].sackSize) / massSum)
                    // @ts-ignore
                    tempValues.set(tempValue.id, tempValue)
                }
            })
        }
        // Find available name
        let n = 1
        let taken = true
        let next = false;

        let currentName = "Optimized " + n
        while (taken) {
            next = false
            combinationMap.forEach((combination: Combination, key) => {
                if (combination.name === currentName) {
                    n++
                    next = true
                }
            })
            if (!next) {
                taken = false
            }
        }
        addCombination(currentName, true, tempValues)
        setIsLoading(false)
    }

    return (
        <div>
            <Grid>
                <OptimizationRunner
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    products={products}
                    enabledProducts={enabledProducts}
                    mode={mode}
                    value={value}
                    combinationMap={combinationMap}
                    handleUpdate={handleUpdate}
                    addCombination={addCombination}/>
            </Grid>

            <Grid>
                <OptimizationResult
                    isLoading={isLoading}
                    products={products}
                    combinationMap={combinationMap}
                    mode={mode}
                    value={value}
                    addCombination={addCombination}
                    optimizationData={optimizationData}
                />
            </Grid>

        </div>
    );

}

export default OptimizationContainer