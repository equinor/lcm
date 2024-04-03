import BridgeContainer from '../Bridging/BridgeContainer'
import CardContainer from './CardContainer'
import OptimizationContainer from '../Optimization/OptimizationContainer'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
// @ts-ignore
import { Accordion, Button } from '@equinor/eds-core-react'
import { BridgeAPI, CombinationAPI } from '../../Api'
// @ts-ignore
import styled from 'styled-components'
import { BridgingOption } from '../../Enums'
import { ErrorToast } from '../Common/Toast'
import { AuthContext, IAuthContext } from 'react-oauth2-code-pkce'
import { Bridge, Combination, Combinations, Products } from '../../Types'
import useLocalStorage from '../../Hooks'

const MainComponentsWrapper = styled.div`
  padding: 16px 0 16px 0;
`

export interface CombinationsWrapperProps {
  products: Products
}

export default ({ products }: CombinationsWrapperProps): ReactElement => {
  const [mode, setMode] = useState<BridgingOption>(BridgingOption.PERMEABILITY)
  const [bridgeValue, setBridgeValue] = useState<number>(500)
  const [combinations, setCombinations] = useLocalStorage<any>('combinations', {})
  const [bridges, setBridges] = useState<Bridge>({ Bridge: [] })
  const { token }: IAuthContext = useContext(AuthContext)

  // Update optimal bridge
  useEffect(() => {
    if (!(bridgeValue >= 1)) return
    BridgeAPI.postBridgeApi(token, {
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
  }, [bridgeValue, mode, token])

  async function fetchBridges(_combinations: Combinations): Promise<any> {
    return await Promise.all(
      // @ts-ignore
      Object.values(_combinations).map(async (c: Combination) => {
        let res = await CombinationAPI.postCombinationApi(token, Object.values(c.values))
        return { [c.name]: res.data.bridge }
      })
    )
  }

  // Create bridges from stored combinations
  useEffect(() => {
    fetchBridges(combinations).then(storedBridges => {
      let newBridges: Bridge = {}
      storedBridges.forEach((b: any) => (newBridges = { ...newBridges, ...b }))

      BridgeAPI.postBridgeApi(token, {
        option: mode,
        value: bridgeValue,
      }).then(response => {
        setBridges({ Bridge: response.data.bridge, ...newBridges })
      })
    })
  }, [])

  function updateCombinationAndFetchBridge(combination: Combination) {
    // Don't fetch with empty values if combination does not exist
    if (!Object.values(combination.values).length && !Object.keys(bridges).includes(combination.name)) return
    CombinationAPI.postCombinationApi(token, Object.values(combination.values))
      .then(response => {
        setBridges({ ...bridges, [combination.name]: response.data.bridge })
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
      })
    setCombinations({ ...combinations, [combination.name]: combination })
  }

  function removeBridge(id: string) {
    let newBridges = bridges
    delete newBridges[id]
    setBridges({ ...newBridges })
  }

  function addCombination(combination: Combination) {
    if (combination.values) updateCombinationAndFetchBridge(combination)
    setCombinations({ ...combinations, [combination.name]: combination })
  }

  async function addCombinationsFromOptimization(sackCombination: Combination, densityCombination: Combination) {
    if (sackCombination.values && densityCombination.values) {
      const newCombinations: Combinations = {
        ...combinations,
        [sackCombination.name]: sackCombination,
        [densityCombination.name]: densityCombination,
      }
      setCombinations(newCombinations)
      const optimizationCombinations: Combinations = {
        [sackCombination.name]: sackCombination,
        [densityCombination.name]: densityCombination,
      }
      await fetchBridges(optimizationCombinations).then(_bridges => {
        let newBridges: Bridge = {}
        _bridges.forEach((b: any) => (newBridges = { ...newBridges, ...b }))
        setBridges({ ...bridges, ...newBridges })
      })
    }
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

  function resetCombinations() {
    setCombinations({})
    setBridges({ Bridge: bridges.Bridge })
  }

  return (
    <>
      {/* Nice to have around for debugging */}
      {/*<pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{JSON.stringify(combinations, null, 2)}</pre>*/}
      <MainComponentsWrapper>
        <BridgeContainer
          bridges={bridges}
          mode={mode}
          setMode={setMode}
          bridgeValue={bridgeValue}
          setValue={setBridgeValue}
        />
      </MainComponentsWrapper>
      <MainComponentsWrapper>
        <Button
          onClick={() => setBridges({ Bridge: bridges.Bridge })}
          color='danger'
          variant='ghost'
          style={{ maxWidth: '130px' }}
        >
          Clear Plot
        </Button>
        <Button style={{ marginLeft: '20px' }} onClick={() => resetCombinations()} color='danger' variant='ghost'>
          Delete combinations
        </Button>
      </MainComponentsWrapper>
      <MainComponentsWrapper>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>Concentration blends</Accordion.Header>
            <Accordion.Panel style={{ overflow: 'auto', backgroundColor: '#f7f7f7' }}>
              <CardContainer
                sacks={false}
                combinations={combinations}
                products={products}
                updateCombination={updateCombinationAndFetchBridge}
                renameCombination={renameCombination}
                addCombination={addCombination}
                removeCombination={removeCombination}
                removeBridge={removeBridge}
                bridges={bridges}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Sack blends</Accordion.Header>
            <Accordion.Panel style={{ overflow: 'auto', backgroundColor: '#f7f7f7' }}>
              <CardContainer
                sacks={true}
                combinations={combinations}
                products={products}
                updateCombination={updateCombinationAndFetchBridge}
                renameCombination={renameCombination}
                removeCombination={removeCombination}
                addCombination={addCombination}
                removeBridge={removeBridge}
                bridges={bridges}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </MainComponentsWrapper>
      <MainComponentsWrapper>
        {/* @ts-ignore*/}
        <OptimizationContainer
          addCombinationsFromOptimization={addCombinationsFromOptimization}
          products={products}
          mode={mode}
          value={bridgeValue}
        />
      </MainComponentsWrapper>
    </>
  )
}
