import React, {ReactElement, useEffect, useRef, useState} from 'react'
import styled from "styled-components";
// @ts-ignore
import {Accordion, SideSheet, Button, TopBar} from "@equinor/eds-core-react";

import SelectProducts from "../Components/Optimization/SelectProducts";
import BridgeContainer from "../Components/Bridging/BridgeContainer.jsx";
import CardContainer from "../Components/Blending/CardContainer.js";
import RefreshButton from "./RefreshButton.js";
import OptimizationContainer from "../Components/Optimization/OptimizationContainer.js";
import {OptimizerAPI} from "../Api"
import {ProductsApi} from "./../gen-api/src/apis/index"
import "../Components/icons"
import {Product} from "../gen-api/src/models";

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

}

const products_api = new ProductsApi();

const getProducts = async (): Promise<any> => {
    const products = await products_api.productsGet()
    return products.reduce(
        (map, obj: Product) => ({...map, [obj.id]: obj}),
        {});
}

export const Main = ({}: AppProps): ReactElement => {
    const [isLoading, setIsLoading] = useState(false)
    const [toggle, setToggle] = useState(true)
    const [products, setProducts] = useState({})
    const [enabledProducts, setEnabledProducts] = useState([])

    // TODO: Seems like these properties are removed from BridgeContainer?
    // const bridgeContainerElement = useRef(null);
    // const [bridgeRefreshCount, setBridgeRefreshCount] = useState(0)

    const [combinationMap, setCombinationMap] = useState(new Map())
    // const [isLoadingMix, setIsLoadingMix] = useState(false)


    useEffect(() => {
        setIsLoading(true)
        getProducts().then(products => {
            setProducts(products)
            setIsLoading(false)
        })
    }, [])

    return (
        <Wrapper>
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
                        setEnabledProducts={setEnabledProducts}/>
                </SideSheet>

                <BridgeContainer/>

                <Accordion>
                    <AccordionItem>
                        <AccordionHeader>Sack combinations</AccordionHeader>
                        <AccordionPanel>
                            <CardContainer
                                sacks={true}
                                combinationMap={combinationMap}
                                loading={isLoading}
                                // fetched={this.state.fetched}
                                productMap={products}
                                // addCombination={this.addCombination}
                                // removeCombination={this.removeCombination}
                                // updateCombination={this.updateCombination}
                                // updateCombinationName={this.updateCombinationName}
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
                                // fetched={this.state.fetched}
                                productMap={products}
                                // addCombination={this.addCombination}
                                // removeCombination={this.removeCombination}
                                // updateCombination={this.updateCombination}
                                // updateCombinationName={this.updateCombinationName}
                            />
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                <OptimizationContainer
                    productMap={products}
                    // combinationMap={this.state.combinationMap}
                    // getBridgeOption={this.getBridgeOption}
                    // getBridgeValue={this.getBridgeValue}
                    // addCombination={this.addCombination}
                />

            </Body>
        </Wrapper>
    )
}

export default Main