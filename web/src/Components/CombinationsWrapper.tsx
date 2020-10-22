import BridgeContainer from './Bridging/BridgeContainer'
import CardContainer from './Blending/CardContainer'
import OptimizationContainer from './Optimization/OptimizationContainer'
import React, { useContext, useEffect, useState } from 'react'
// @ts-ignore
import { Accordion } from '@equinor/eds-core-react'
import { OptimizerAPI, Requests } from '../Api'
import { AuthContext } from '../Auth/Auth'
// @ts-ignore
import { isEqual, cloneDeep, omit } from 'lodash'

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
  const [bridges, setBridges] = useState<any>({ Bridge: [] })
  const apiToken: string = useContext(AuthContext)?.jwtIdToken

  const [lastCombinations, setLastCombinations] = useState<Combinations>({})

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
        setBridges({ ['Bridge']: response.data.bridge })
      })
      .catch(err => {
        console.error('fetch error' + err)
      })
  }, [bridgeValue, mode])

  useEffect(() => {
    Object.values(combinations).forEach(combination => {
      const bridgeNames = Object.keys(bridges).filter(n => n!== 'Bridge')
      const combNames = Object.values(combinations).map(c => c.name)
      const diff = bridgeNames.filter(b => !combNames.includes(b))
      if(diff.length){
        console.log(diff)
        setBridges(omit(bridges, diff[0]))
        return
      }

      // Don't fetch with empty values
      if (!Object.values(combination.values).length) return

      // If the combination changed, fetch a new bridge
      if (!isEqual(lastCombinations[combination.id], combination)) {
        setIsLoading(true)
        console.log(`Fetching ${combination.name}`)
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
            setBridges({ ...bridges, [combination.name]: response.data.cumulative })
          })
          .catch(() => setIsLoading(false))
      }
    })
    setLastCombinations(cloneDeep(combinations))
  }, [combinations])

  return (
    <>
      {/* Nice to have around for debugging */}
      {/*<pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{JSON.stringify(combinations, null, 2)}</pre>*/}
      <BridgeContainer
        userBridges={bridges}
        mode={mode}
        setMode={setMode}
        bridgeValue={bridgeValue}
        setValue={setBridgeValue}
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
