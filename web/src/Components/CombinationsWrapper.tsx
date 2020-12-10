import BridgeContainer from './Bridging/BridgeContainer'
import CardContainer from './Combinations/CardContainer'
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
import { Bridge, Combination, Combinations, Products } from '../Types'
import useLocalStorage from '../Hooks'

const { AccordionItem, AccordionHeader, AccordionPanel } = Accordion

const MainComponentsWrapper = styled.div`
  padding: 16px 0 16px 0;
`

export default ({ products }: Products) => {
  const [mode, setMode] = useState<BridgingOption>(BridgingOption.PERMEABILITY)
  const [bridgeValue, setBridgeValue] = useState<number>(500)
  const [combinations, setCombinations] = useLocalStorage<any>('combinations', {})
  const [bridges, setBridges] = useState<Bridge>({ Bridge: [] })
  const apiToken: string = useContext(AuthContext).token

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

  async function fetchAllBridges(): Promise<any> {
    return await Promise.all(
      // @ts-ignore
      Object.values(combinations).map(async (c: Combination) => {
        let res = await CombinationAPI.postCombinationApi(apiToken, Object.values(c.values))
        return { [c.name]: res.data.bridge }
      })
    )
  }

  // Create bridges from stored combinations
  useEffect(() => {
    fetchAllBridges().then(storedBridges => {
      let newBridges: Bridge = {}
      storedBridges.forEach((b: any) => (newBridges = { ...newBridges, ...b }))

      BridgeAPI.postBridgeApi(apiToken, {
        option: mode,
        value: bridgeValue,
      }).then(response => {
        setBridges({ Bridge: response.data.bridge, ...newBridges })
      })
    })
  }, [])

  function updateCombinationAndFetchBridge(combination: Combination) {
    // Don't fetch with empty values
    if (!Object.values(combination.values).length) return
    CombinationAPI.postCombinationApi(apiToken, Object.values(combination.values))
      .then(response => {
        setBridges({ ...bridges, [combination.name]: response.data.bridge })
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
      })
    setCombinations({ ...combinations, [combination.name]: combination })
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

  function resetCombinations(sacks: boolean) {
    let newCombinations: Combinations = {}
    let newBridges: Bridge = { Bridge: bridges.Bridge }
    // @ts-ignore
    Object.values(combinations).forEach((c: Combination) => {
      if (c.sacks !== sacks) {
        newCombinations[c.name] = c
        newBridges[c.name] = bridges[c.name]
      }
    })
    setCombinations({ ...newCombinations })
    setBridges({ ...newBridges })
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
                products={products}
                updateCombination={updateCombinationAndFetchBridge}
                renameCombination={renameCombination}
                removeCombination={removeCombination}
                addCombination={addCombination}
                resetCombinations={resetCombinations}
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionHeader>Manual combinations</AccordionHeader>
            <AccordionPanel style={{ overflow: 'auto' }}>
              <CardContainer
                sacks={false}
                combinations={combinations}
                products={products}
                updateCombination={updateCombinationAndFetchBridge}
                renameCombination={renameCombination}
                addCombination={addCombination}
                removeCombination={removeCombination}
                resetCombinations={resetCombinations}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </MainComponentsWrapper>
      <MainComponentsWrapper>
        {/* @ts-ignore*/}
        <OptimizationContainer addCombination={addCombination} products={products} mode={mode} value={bridgeValue} />
      </MainComponentsWrapper>
    </>
  )
}
