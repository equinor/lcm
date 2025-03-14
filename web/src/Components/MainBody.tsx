import { Accordion, Button, Icon, Typography } from '@equinor/eds-core-react'
import { delete_to_trash, visibility_off } from '@equinor/eds-icons'
import { type ReactElement, useContext, useEffect, useState } from 'react'
import { AuthContext, type IAuthContext } from 'react-oauth2-code-pkce'
import styled from 'styled-components'
import { BridgeAPI, CombinationAPI } from '../Api'
import { BridgingOption } from '../Enums'
import useLocalStorage from '../Hooks'
import type { Bridge, Combination, Combinations, Products } from '../Types'
import { colors } from '../colors'
import BridgeContainer from './Bridging/BridgeContainer'
import CardContainer from './Combinations/CardContainer'
import { ErrorToast } from './Common/Toast'
import OptimizationContainer from './Optimization/OptimizationContainer'

const MainComponentsWrapper = styled.div`
  padding: 16px 0 16px 0;
`

export interface MainBodyProps {
  products: Products
}

export default ({ products }: MainBodyProps): ReactElement => {
  const [mode, setMode] = useState<BridgingOption>(BridgingOption.PERMEABILITY)
  const [bridgeValue, setBridgeValue] = useState<number>(500)
  const [combinations, setCombinations] = useLocalStorage<Combinations>('combinations', {})
  const [bridges, setBridges] = useState<Bridge>({ Bridge: [] })
  const { token }: IAuthContext = useContext(AuthContext)

  // Update optimal bridge
  useEffect(() => {
    if (!(bridgeValue >= 1)) return
    BridgeAPI.postBridgeApi(token, {
      option: mode,
      value: bridgeValue,
    })
      .then((response) => {
        setBridges({ ...bridges, Bridge: response.data.bridge })
      })
      .catch((error) => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(`fetch error ${error}`)
      })
  }, [bridgeValue, mode, token])

  async function fetchBridges(_combinations: Combinations): Promise<Bridge[]> {
    return await Promise.all(
      Object.values(_combinations).map(async (c: Combination) => {
        const res = await CombinationAPI.postCombinationApi(token, Object.values(c.values))
        return { [c.name]: res.data.bridge }
      })
    )
  }

  // Create bridges from stored combinations
  useEffect(() => {
    fetchBridges(combinations as Combinations).then((storedBridges) => {
      let newBridges: Bridge = {}
      storedBridges.forEach((b: Bridge) => {
        newBridges = { ...newBridges, ...b }
      })

      BridgeAPI.postBridgeApi(token, {
        option: mode,
        value: bridgeValue,
      }).then((response) => {
        setBridges({ Bridge: response.data.bridge, ...newBridges })
      })
    })
  }, [])

  function updateCombinationAndFetchBridge(combination: Combination) {
    // Don't fetch with empty values if combination does not exist
    if (!Object.values(combination.values).length && !Object.keys(bridges).includes(combination.name)) return
    CombinationAPI.postCombinationApi(token, Object.values(combination.values))
      .then((response) => {
        setBridges({ ...bridges, [combination.name]: response.data.bridge })
      })
      .catch((error) => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(`fetch error ${error}`)
      })
    setCombinations({ ...combinations, [combination.name]: combination })
  }

  function removeBridge(id: string) {
    const newBridges = bridges
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
      await fetchBridges(optimizationCombinations).then((_bridges) => {
        let newBridges: Bridge = {}
        _bridges.forEach((b: Bridge) => {
          newBridges = { ...newBridges, ...b }
        })
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
    const tempCombination: Combinations = combinations
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
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant={'h3'}>Blends</Typography>
            {/* <Icon style={{ cursor: 'pointer', paddingLeft: '5px' }} data={info_circle} /> */}
          </div>
          <div style={{ display: 'flex' }}>
            <Button
              onClick={() => setBridges({ Bridge: bridges.Bridge })}
              color="danger"
              variant="ghost"
              style={{ maxWidth: '130px' }}
            >
              <Icon data={visibility_off} />
              Hide blends
            </Button>
            <Button style={{ marginLeft: '20px' }} onClick={() => resetCombinations()} color="danger" variant="ghost">
              <Icon data={delete_to_trash} />
              Delete blends
            </Button>
          </div>
        </div>

        <div style={{ padding: '0.5rem 0px 0.5rem 0px' }}>
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Concentration blends</Accordion.Header>
              <Accordion.Panel
                style={{
                  overflow: 'auto',
                  backgroundColor: `${colors.background}`,
                }}
              >
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
        </div>
      </div>
      <MainComponentsWrapper>
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
