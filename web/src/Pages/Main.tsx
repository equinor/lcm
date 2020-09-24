// @ts-ignore
import React, {ReactElement, useEffect, useState} from 'react'
import styled from "styled-components";
// @ts-ignore
import {Accordion, SideSheet, Button, TopBar} from "@equinor/eds-core-react";

import SelectProducts from "../Components/Optimization/SelectProducts";
import BridgeContainer from "../Components/Bridging/BridgeContainer.jsx";
import CardContainer from "../Components/Blending/CardContainer";
import RefreshButton from "./RefreshButton.js";
import OptimizationContainer from "../Components/Optimization/OptimizationContainer";
import {OptimizerAPI} from "../Api"
import {ProductsApi} from "./../gen-api/src/apis/index"
import "../Components/icons"
import {Product} from "../gen-api/src/models";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

const {AccordionItem, AccordionHeader, AccordionPanel} = Accordion;

const Wrapper = styled.div`
  height: 100vh;
  overflow: auto;
`

const Body = styled.div`
  position: relative;
  height: "fit-content";
  background: #ebebeb;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  font-family: "Equinor";
`

interface AppProps {
    defaultState: any
}


const getProducts = async (): Promise<any> => {
    const products_api = new ProductsApi();
    const products = await products_api.productsGet()
    return products.reduce(
        (map, obj: Product) => ({...map, [obj.id]: obj}),
        {});
}

export interface CombinationValue {
    id: string
    value: number
    percentage: number
}

export interface Combination {
    id: string
    name: string
    sacks: boolean
    values: Map<string, CombinationValue>
    cumulative: any
}

export const Main = ({defaultState}: AppProps): ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [toggle, setToggle] = useState<boolean>(true)
    const [products, setProducts] = useState<Map<string, Product>>(new Map())
    const [enabledProducts, setEnabledProducts] = useState<Array<string>>([])
    const [combinationMap, setCombinationMap] = useState<Map<string, Combination>>(defaultState)
    const [isLoadingMix, setIsLoadingMix] = useState<boolean>(false)
    const [mode, setMode] = useState<string>('PERMEABILITY')
    const [value, setValue] = useState<number>(500)

    useEffect(() => {
        setIsLoading(true)
        getProducts().then(products => {
            setProducts(products)
            // Enable all products by default
            const productList: Array<Product> = Object.values(products);
            setEnabledProducts(productList.map((product: Product) => product.id))
            setIsLoading(false)
        })
    }, [])

    const updateProduct = (productId: string, isChecked: boolean) => {
        combinationMap.forEach((combination: Combination) => {
            if (combination.values.has(productId)) {
                if (isChecked) {
                    combination.values.delete(productId);
                }
                combination = calculatePercentage(combination)
                calculateMixOfProducts(combination)
            }
        });

        if (isChecked) {
            setEnabledProducts(enabledProducts.filter((enabled: string) => enabled !== productId))
        } else {
            setEnabledProducts([...enabledProducts, productId])
        }
    }

    const setCombination = (combination: Combination) => {
        // Need to create new reference
        let combinations = new Map([
            ...combinationMap,
            [combination.id, combination]
        ])
        setCombinationMap(combinations)
    }

    const calculateMixOfProducts = (combination: any) => {
        setIsLoadingMix(true)

        const combinationValues = [...combination.values.values()]

        if (combinationValues.length > 0) {
            OptimizerAPI.postOptimizerApi({
                request: "MIX_PRODUCTS",
                products: combinationValues,
            })
                .then((response) => {
                    if (combination) {
                        combination["cumulative"] = response.data.cumulative;
                        setCombination(combination)
                    }
                    setIsLoadingMix(false)
                })
                .catch((error) => {
                    console.log("fetch error" + error);
                    setIsLoadingMix(false)
                });
        }
    }

    const addCombination = (name: string, sacks: boolean, defaultValues: any = null) => {
        let combination = {
            id: uuidv4(),
            name: name,
            sacks: sacks,
            values: defaultValues || new Map(),
            cumulative: null
        };
        calculateMixOfProducts(combination)
    }

    const removeCombination = (combinationId: string) => {
        combinationMap.delete(combinationId)
        setCombinationMap(new Map([...combinationMap]))
    }

    const calculatePercentage = (combination: Combination): Combination => {
        const getProductMass = (combinationValue: CombinationValue): number => {
            if (combination.sacks) {
                // @ts-ignore
                const product: Product = products[combinationValue.id]
                // @ts-ignore
                return combinationValue.value * product.sackSize
            } else {
                return combinationValue.value
            }
        }

        let massSum = 0;
        combination.values.forEach((combinationValue: CombinationValue) => {
            massSum += getProductMass(combinationValue)
        })

        // Set the percentages to the value object for combination
        combination.values.forEach((value: CombinationValue) => {
            if (combination.sacks) {
                // @ts-ignore
                const product: Product = products[value.id]
                // @ts-ignore
                value.percentage = 100 * (value.value * product.sackSize / massSum)
            } else {
                value.percentage = 100 * (value.value / massSum)
            }

            combination.values.set(value.id, value);
        });
        return combination
    }

    const setProductInCombination = (combinationId: string, productId: string, value: any) => {
        // @ts-ignore
        let combination: Combination = combinationMap.get(combinationId);
        if (combination) {
            if (!value) {
                combination.values.delete(productId)
            } else {
                combination.values.set(productId,
                    {
                        id: productId,
                        value: parseFloat(value),
                        percentage: 0.0
                    }
                );
            }

            combination = calculatePercentage(combination)
            calculateMixOfProducts(combination)
        }
    }

    const updateCombinationName = (combinationId: string, name: string) => {
        combinationMap.forEach((combination: Combination) => {
            if (combination.name === name) {
                alert("Name of combination already taken. Please select another one")
                return
            }
        })

        // @ts-ignore
        let combination: Combination = combinationMap.get(combinationId);
        if (combination) {
            combination.name = name
            setCombination(combination)
        }
    }

    return (
        <Wrapper>
            <TopBar style={{height: 'fit-content'}}>
                <RefreshButton/>
                <div>
                    <Button
                        variant="outlined"
                        onClick={() => setToggle(true)}>
                        Select products
                    </Button>
                </div>
            </TopBar>

            <Body>
                <SideSheet
                    variant="medium"
                    title="Select products:"
                    open={toggle}
                    onClose={() => setToggle(false)}>
                    <SelectProducts
                        loading={isLoading}
                        products={products}
                        enabledProducts={enabledProducts}
                        updateProduct={updateProduct}/>
                </SideSheet>

                <BridgeContainer
                    combinationMap={combinationMap}
                    isLoadingMix={isLoadingMix}
                    mode={mode}
                    setMode={setMode}
                    value={value}
                    setValue={setValue}
                />

                <Accordion>
                    <AccordionItem>
                        <AccordionHeader>Sack combinations</AccordionHeader>
                        <AccordionPanel>
                            <CardContainer
                                sacks={true}
                                combinationMap={combinationMap}
                                enabledProducts={enabledProducts}
                                loading={isLoading}
                                products={products}
                                addCombination={addCombination}
                                removeCombination={removeCombination}
                                updateCombination={setProductInCombination}
                                updateCombinationName={updateCombinationName}
                            />
                        </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionHeader>Manual combinations</AccordionHeader>
                        <AccordionPanel>
                            <CardContainer
                                sacks={false}
                                combinationMap={combinationMap}
                                loading={isLoading}
                                enabledProducts={enabledProducts}
                                products={products}
                                addCombination={addCombination}
                                removeCombination={removeCombination}
                                updateCombination={setProductInCombination}
                                updateCombinationName={updateCombinationName}
                            />
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                <OptimizationContainer
                    products={products}
                    enabledProducts={enabledProducts}
                    combinationMap={combinationMap}
                    mode={mode}
                    value={value}
                    addCombination={addCombination}
                />

            </Body>
        </Wrapper>
    )
}

export default Main