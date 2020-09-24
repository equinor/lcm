import {Product} from "../../gen-api/src/models";
import {Combination} from "../../Pages/Main";
import {OptimizerAPI} from "../../Api";
import PillInput, {Pill} from "./PillInput";
import {Environmental, Weight, WeightOptions} from "./WeightOptions";
import React, {ReactElement, useState} from "react";
// @ts-ignore
import {Typography, StarProgress} from "@equinor/eds-core-react";
import styled from "styled-components";
// @ts-ignore
import {Button} from '@equinor/eds-core-react';

const WrapperHeader = styled.div`
  padding-bottom: 2rem;
`;

const Wrapper = styled.div`
  padding-top: 4rem;
`;

interface OptimizationContainerProps {
    isLoading: boolean
    setIsLoading: Function
    products: Map<string, Product>
    enabledProducts: Array<string>
    combinationMap: Map<string, Combination>
    mode: string
    value: number
    addCombination: Function
    handleUpdate: Function
}


const getWeightPercentages = (weight: Weight) => {
    const {fit, co2, cost, mass, environmental} = weight
    let sum: number = fit + co2 + cost + mass
    return {
        "best_fit": 100 * (fit / sum),
        "mass_fit": 100 * (mass / sum),
        "co2": 100 * (co2 / sum),
        "cost": 100 * (cost / sum)
    }
}

interface getOptimalBlendProps {
    enabledProducts: Array<string>
    mode: string
    value: number
    pill: Pill,
    weight: Weight
    handleUpdate: Function
}

const getOptimalBlend = ({enabledProducts, pill, weight, mode, value, handleUpdate}: getOptimalBlendProps) => {
    if (enabledProducts.length === 0) {
        alert("Please select at least 1 product before running the optimizer")
        return null
    }

    OptimizerAPI.postOptimizerApi({
        request: "OPTIMAL_MIX",
        name: "Optimal Blend",
        value: value,
        option: mode,
        mass: pill.mass,
        enviromental: weight.environmental,
        products: enabledProducts,
        weights: getWeightPercentages(weight)
    })
        .then((response) => {
            handleUpdate(response.data)
        }).catch((error) => console.log("fetch error" + error));
}

const OptimizationRunner = ({isLoading, setIsLoading, products, enabledProducts, combinationMap, mode, value, handleUpdate}: OptimizationContainerProps): ReactElement => {
    const [pill, setPill] = useState<Pill>({
        volume: 10,
        density: 350,
        mass: 3500
    })

    const [weight, setWeight] = useState<Weight>({
        fit: 5,
        co2: 0,
        cost: 0,
        mass: 5,
        environmental: [Environmental.GREEN, Environmental.BLACK, Environmental.RED, Environmental.YELLOW]
    })

    const handleOptimize = () => {
        let countSackCombinations = 0
        combinationMap.forEach((combination, key) => {
            if (combination.sacks) {
                countSackCombinations += 1
            }
        })
        if (countSackCombinations < 5) {
            setIsLoading(true)
            getOptimalBlend({
                enabledProducts,
                pill,
                weight,
                mode,
                value,
                handleUpdate
            })
        } else {
            alert("Please remove a at least 1 sack combination before running the optimizer")
        }
    }

    return (
        <>
            <div>
                <WrapperHeader>
                    <Typography variant="h2">Optimizer</Typography>
                </WrapperHeader>
                <PillInput
                    pill={pill}
                    setPill={setPill}
                    isLoading={isLoading}/>
                <Button
                    variant="outlined"
                    onClick={(event: any) => {
                        handleOptimize()
                    }}
                    disabled={isLoading}>
                    Run optimizer
                </Button>
                <Wrapper>
                    {isLoading && <StarProgress/>}
                </Wrapper>
            </div>
            <div>
                <WeightOptions
                    weight={weight}
                    setWeight={setWeight}
                    isLoading={isLoading}/>
            </div>
        </>
    );
}

export default OptimizationRunner