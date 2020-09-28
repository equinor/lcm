import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Radio, TextField, Typography } from '@equinor/eds-core-react'
import BridgeGraph from "./BridgeGraph.jsx"
import { OptimizerAPI, Requests } from "../../Api"
import { BridgingOption } from "../../Common"

const Wrapper = styled.div`
  display: grid;
  padding: 0px;
  padding-bottom: 2rem;
  grid-gap: 2rem;
  position: relative;
  transition: all 0.36s;
  grid-template-columns: repeat(1, fit-content(100%));
`

const WrapperHeader = styled.div`
  padding-bottom: 2rem;
`

const UnstyledList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
`

const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  display: flex;
  grid-gap: 0px 100px;
`


export default ({ userBridges, mode, setMode, bridgeValue, setValue, isLoading }) => {
  const [sizeFractions, setSizeFractions] = useState([])
  const [bridges, setBridges] = useState([])
  const [unit, setUnit] = useState('mD')
  const [bridgeValueHelperText, setBridgeValueHelperText] = useState(undefined)
  const [bridgeValueVariant, setBridgeValueVariant] = useState(undefined)

  function bridgingOptionChange(event) {
    switch (event.target.value) {
      case BridgingOption.PERMEABILITY:
        setMode(BridgingOption.PERMEABILITY)
        setUnit('mD')
        break
      case BridgingOption.AVERAGE_PORESIZE:
        setMode(BridgingOption.AVERAGE_PORESIZE)
        setUnit('microns')
        break

      case BridgingOption.MAXIMUM_PORESIZE:
        setMode(BridgingOption.MAXIMUM_PORESIZE)
        setUnit('microns')
        break
      default:
        return
    }
  }

  function onBridgeValueChange(event) {
    const newBridgeValue = parseInt(event.target.value)
    // TODO: Setting invalid values on parent is not good
    setValue(newBridgeValue)

    if (Math.sign(newBridgeValue) !== 1) {
      setBridgeValueHelperText("Value must be an integer bigger than 0")
      setBridgeValueVariant("error")
      return
    }

    setBridgeValueVariant(undefined)
    setBridgeValueHelperText(undefined)
  }

  // Load size fractions once on first render
  useEffect(()=>{
    OptimizerAPI.postOptimizerApi({ "request": Requests.SIZE_FRACTIONS })
        .then(response => {
          setSizeFractions(response.data.size_fractions)
        })
        .catch(err => {
          console.error("fetch error" + err)
        })
  },[])

  // Load
  useEffect(() => {
    if (!bridgeValue >= 1) return
    OptimizerAPI.postOptimizerApi({
      "request": Requests.BRIDGE,
      "option": mode,
      "value": bridgeValue,
    }).then(response => {
      const index = bridges.find(b => b.name === "Bridge")
      if (index > 0) {
        bridges[index] = { name: "Bridge", cumulative: response.data.bridge }
        setBridges(bridges)
      } else {
        setBridges([{ name: "Bridge", cumulative: response.data.bridge }, ...userBridges])
      }
    }).catch(err => {
      console.error("fetch error" + err)
    })

  }, [bridgeValue, mode, userBridges])

  return (
      <Wrapper>
        <Grid>
          <div>
            <WrapperHeader>
              <Typography variant="h2">Bridging options</Typography>
            </WrapperHeader>
            <Wrapper>
              <legend>Bridging based on:</legend>
              <UnstyledList>
                <li>
                  <Radio
                      label="Permeability"
                      name="group"
                      value={BridgingOption.PERMEABILITY}
                      onChange={bridgingOptionChange}
                      checked={(mode === BridgingOption.PERMEABILITY)}
                  />
                </li>
                <li>
                  <Radio
                      label="Average poresize"
                      name="group"
                      value={BridgingOption.AVERAGE_PORESIZE}
                      onChange={bridgingOptionChange}
                      checked={(mode === BridgingOption.AVERAGE_PORESIZE)}
                  />
                </li>
                <li>
                  <Radio
                      label="Maximum poresize"
                      name="group"
                      value={BridgingOption.MAXIMUM_PORESIZE}
                      onChange={bridgingOptionChange}
                      checked={(mode === BridgingOption.MAXIMUM_PORESIZE)}
                  />
                </li>
              </UnstyledList>
              <legend>Enter value:</legend>
              <TextField
                  type="number"
                  id="textfield-number"
                  meta={unit}
                  value={bridgeValue || 0}
                  onChange={onBridgeValueChange}
                  variant={bridgeValueVariant}
                  helperText={bridgeValueHelperText}
              />
            </Wrapper>
          </div>
          {bridges && <BridgeGraph bridgeAndCombinations={bridges} sizeFractions={sizeFractions}/>}
        </Grid>
      </Wrapper>
  )
}