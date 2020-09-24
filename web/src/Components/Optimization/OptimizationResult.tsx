import React, {ReactElement} from "react";
import SolutionData from "./SolutionData";
import SolutionVisualisations from "./SolutionVisualisations";
import {Product} from "../../gen-api/src/models";
import {Combination} from "../../Pages/Main";

interface OptimizationResultProps {
    products: Map<string, Product>
    combinationMap: Map<string, Combination>
    mode: string
    value: number
    addCombination: Function
    isLoading: boolean
    optimizationData: any
}

export const OptimizationResult = ({products, combinationMap, isLoading, optimizationData, addCombination}: OptimizationResultProps): ReactElement => {

    return (
        <>
            <SolutionData products={products}
                          combinationMap={combinationMap}
                          loading={isLoading}
                          optimizationData={optimizationData}
                          addCombination={addCombination}/>
            <div>
                <SolutionVisualisations
                    products={products}
                    loading={isLoading}
                    optimizationData={optimizationData}/>
            </div>
        </>
    )
}

export default OptimizationResult