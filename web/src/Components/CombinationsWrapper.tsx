import BridgeContainer from './Bridging/BridgeContainer'
import CardContainer from './Blending/CardContainer'
import OptimizationContainer from './Optimization/OptimizationContainer'
import React, { useContext, useEffect, useState } from 'react'
// @ts-ignore
import { Accordion } from '@equinor/eds-core-react'
import { OptimizerAPI, Requests } from '../Api'
import { AuthContext } from '../Auth/Auth'

const { AccordionItem, AccordionHeader, AccordionPanel } = Accordion

interface AppProps {
  enabledProducts: Array<string>
  products: any
  defaultCombinations: Combinations
}

export interface ProductValues {
  id: string
  value: number
  percentage: number
}

export interface ProductsInCombination {
  [id: string]: ProductValues
}

export interface Combination {
  id: string
  name: string
  sacks: boolean
  values: ProductsInCombination
  cumulative: any
}

export interface Combinations {
  [id: string]: Combination
}

export interface Bridge {
  [name: string]: Array<number>
}

export default ({ enabledProducts, products, defaultCombinations }: AppProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [mode, setMode] = useState<string>('PERMEABILITY')
  const [bridgeValue, setBridgeValue] = useState<number>(500)
  const [combinations, setCombinations] = useState<Combinations>(defaultCombinations)
  const [combinationBridges, setCombinationBridges] = useState<any>({ ['Bridge']: [] })
  const apiToken: string = useContext(AuthContext)?.jwtIdToken

  // When enabledProducts changes. Removed the ones not enabled from the combinations.
  useEffect(() => {
    let newCombinations = {}
    Object.values(combinations).forEach(combination => {
      let newCombination = {}
      let newValues = {}
      Object.entries(combination.values).forEach(([id, value]) => {
        if (enabledProducts.includes(value.id)) newValues = { ...newValues, [id]: value }
      })
      newCombination = { ...combination, values: newValues }
      newCombinations = { ...newCombinations, [combination.id]: newCombination }
    })
    setCombinations(newCombinations)
  }, [enabledProducts])

  useEffect(() => {
    // @ts-ignore
    if (!bridgeValue >= 1) return
    OptimizerAPI.postOptimizerApi(apiToken, {
      request: Requests.BRIDGE,
      option: mode,
      value: bridgeValue,
    })
      .then(response => {
        setCombinationBridges({ ['Bridge']: response.data.bridge })
      })
      .catch(err => {
        console.error('fetch error' + err)
      })
  }, [bridgeValue, mode])

  useEffect(() => {
    // TODO: Some sort of check here on what has changed, so we dont re-fetch every combination on every change
    Object.values(combinations).forEach(combination => {
      // Dont fetch with empty values
      if (!Object.values(combination.values).length) return

      // TODO
      // Only keep bridges that has a combination
      // @ts-ignore
      // if(combinationBridges[combination.name]) newBridges[combination.name] = combinationBridges[combination.name]

      setIsLoading(true)
      OptimizerAPI.postOptimizerApi(apiToken, {
        request: Requests.MIX_PRODUCTS,
        products: Object.values(combination.values),
      })
        .then(response => {
          setIsLoading(false)
          if (response.data.missing.length) {
            let message = 'Some requested products where missing or has a name mismatch;'
            response.data.missing.forEach((missingProd: string) => (message += `\n - ${missingProd}`))
            alert(message)
          }
          setCombinationBridges({ ...combinationBridges, [combination.name]: response.data.cumulative })
        })
        .catch(() => setIsLoading(false))
    })
  }, [combinations])

  return (
    <>
      {/* Nice to have around for debugging */}
      {/*<pre style={{whiteSpace: "pre-wrap", wordWrap: "break-word"}}>{JSON.stringify(combinations, null, 2)}</pre>*/}
      <BridgeContainer
        userBridges={combinationBridges}
        mode={mode}
        setMode={setMode}
        bridgeValue={bridgeValue}
        setValue={setBridgeValue}
        isLoading={isLoading}
      />

      <Accordion>
        <AccordionItem>
          <AccordionHeader>Sack combinations</AccordionHeader>
          <AccordionPanel>
            <CardContainer
              sacks={true}
              combinations={combinations}
              setCombinations={setCombinations}
              enabledProducts={enabledProducts}
              loading={isLoading}
              products={products}
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader>Manual combinations</AccordionHeader>
          <AccordionPanel>
            <CardContainer
              sacks={false}
              combinations={combinations}
              setCombinations={setCombinations}
              loading={isLoading}
              enabledProducts={enabledProducts}
              products={products}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <OptimizationContainer
        products={products}
        enabledProducts={enabledProducts}
        combinations={combinations}
        setCombinations={setCombinations}
        mode={mode}
        value={bridgeValue}
      />
    </>
  )
}
