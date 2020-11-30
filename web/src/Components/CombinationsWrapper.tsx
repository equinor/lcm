import BridgeContainer from './Bridging/BridgeContainer'
import CardContainer from './Blending/CardContainer'
import OptimizationContainer from './Optimization/OptimizationContainer'
import React, { useContext, useEffect, useState } from 'react'
// @ts-ignore
import { Accordion } from '@equinor/eds-core-react'
import { BridgeAPI, CombinationAPI } from '../Api'
// @ts-ignore
import styled from 'styled-components'
import { BridgingOption } from '../Enums'
import { ErrorToast } from './Common/Toast'
import { AuthContext } from '../Context'

const { AccordionItem, AccordionHeader, AccordionPanel } = Accordion

const MainComponentsWrapper = styled.div`
  padding: 16px 0 16px 0;
`

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
  name: string
  sacks: boolean
  values: ProductsInCombination
  cumulative: any
}

export interface Combinations {
  [name: string]: Combination
}

export interface Bridge {
  [name: string]: Array<number>
}

export default ({ enabledProducts, products, defaultCombinations }: AppProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [mode, setMode] = useState<BridgingOption>(BridgingOption.PERMEABILITY)
  const [bridgeValue, setBridgeValue] = useState<number>(500)
  const [combinations, setCombinations] = useState<Combinations>(defaultCombinations)
  const [bridges, setBridges] = useState<Bridge>({ Bridge: [] })
  const apiToken: string = useContext(AuthContext).token

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
      newCombinations = { ...newCombinations, [combination.name]: newCombination }
    })
    setCombinations(newCombinations)
  }, [enabledProducts])

  // Update optimal bridge
  useEffect(() => {
    if (!(bridgeValue >= 1)) return
    BridgeAPI.postBridgeApi(apiToken, {
      option: mode,
      value: bridgeValue,
    })
      .then(response => {
        setBridges({ ...bridges, Bridge: response.data.bridge })
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
      })
  }, [bridgeValue, mode, apiToken])

  function updateCombinationAndFetchBridge(combination: Combination) {
    // Don't fetch with empty values
    if (!Object.values(combination.values).length) return
    setLoading(true)
    CombinationAPI.postCombinationApi(apiToken, Object.values(combination.values))
      .then(response => {
        setLoading(false)
        setBridges({ ...bridges, [combination.name]: response.data.bridge })
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
        setLoading(false)
      })
    setCombinations({ ...combinations, [combination.name]: combination })
    setLoading(false)
  }

  function addCombination(combination: Combination) {
    if (combination.values) updateCombinationAndFetchBridge(combination)
    setCombinations({ ...combinations, [combination.name]: combination })
  }

  function renameCombination(newName: string, oldName: string) {
    const oldCombo = combinations[oldName]
    delete combinations[oldName]
    oldCombo.name = newName
    combinations[newName] = oldCombo
    setCombinations({ ...combinations })

    if (Object.keys(bridges).includes(oldName)) {
      bridges[newName] = bridges[oldName]
      delete bridges[oldName]
      setBridges({ ...bridges })
    }
  }

  function removeCombination(combinationName: string) {
    let tempCombination: Combinations = combinations
    delete tempCombination[combinationName]
    setCombinations({ ...tempCombination })
    delete bridges[combinationName]
    setBridges({ ...bridges })
  }

  return (
    <>
      {/* Nice to have around for debugging */}
      {/*<pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{JSON.stringify(combinations, null, 2)}</pre>*/}
      <MainComponentsWrapper>
        <BridgeContainer
          userBridges={bridges}
          mode={mode}
          setMode={setMode}
          bridgeValue={bridgeValue}
          setValue={setBridgeValue}
          setBridges={setBridges}
        />
      </MainComponentsWrapper>
      <MainComponentsWrapper>
        <Accordion>
          <AccordionItem>
            <AccordionHeader>Sack combinations</AccordionHeader>
            <AccordionPanel style={{ overflow: 'auto' }}>
              <CardContainer
                sacks={true}
                combinations={combinations}
                enabledProducts={enabledProducts}
                products={products}
                updateCombination={updateCombinationAndFetchBridge}
                renameCombination={renameCombination}
                removeCombination={removeCombination}
                addCombination={addCombination}
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionHeader>Manual combinations</AccordionHeader>
            <AccordionPanel style={{ overflow: 'auto' }}>
              <CardContainer
                sacks={false}
                combinations={combinations}
                enabledProducts={enabledProducts}
                products={products}
                updateCombination={updateCombinationAndFetchBridge}
                renameCombination={renameCombination}
                addCombination={addCombination}
                removeCombination={removeCombination}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </MainComponentsWrapper>
      <MainComponentsWrapper>
        <OptimizationContainer
          addCombination={addCombination}
          products={products}
          enabledProducts={enabledProducts}
          mode={mode}
          value={bridgeValue}
        />
      </MainComponentsWrapper>
    </>
  )
}
