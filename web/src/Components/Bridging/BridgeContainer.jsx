import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Radio, TextField, Typography, Button } from '@equinor/eds-core-react'
import BridgeGraph from './BridgeGraph.jsx'
import { OptimizerAPI, Requests } from '../../Api'
import { BridgingOption } from '../../Common'
import { AuthContext } from "../../Auth/AuthProvider"

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const BridgeWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 20px;
`

const RadioWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export default ({ userBridges, mode, setMode, bridgeValue, setValue, setBridges}) => {
  const [sizeFractions, setSizeFractions] = useState([])
  const [unit, setUnit] = useState('mD')
  const [bridgeValueHelperText, setBridgeValueHelperText] = useState(undefined)
  const [bridgeValueVariant, setBridgeValueVariant] = useState(undefined)

  const apiToken = useContext(AuthContext).token

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
      setBridgeValueHelperText('Value must be an integer bigger than 0')
      setBridgeValueVariant('error')
      return
    }

    setBridgeValueVariant(undefined)
    setBridgeValueHelperText(undefined)
  }

  function clearBridges(){
    setBridges({Bridge: userBridges.Bridge})
  }

  // Load size fractions once on first render
  useEffect(() => {
    OptimizerAPI.postOptimizerApi(apiToken,{ request: Requests.SIZE_FRACTIONS })
      .then(response => {
        setSizeFractions(response.data.size_fractions)
      })
      .catch(err => {
        console.error('fetch error' + err)
      })
  }, [])

  return (
        <BridgeWrapper>
        <InputWrapper>
            <Typography variant="h2">Bridging options</Typography>
            <span>Bridging based on:</span>
              <RadioWrapper>
                <Radio
                  label="Permeability"
                  name="group"
                  value={BridgingOption.PERMEABILITY}
                  onChange={bridgingOptionChange}
                  checked={mode === BridgingOption.PERMEABILITY}
                />
                <Radio
                  label="Average poresize"
                  name="group"
                  value={BridgingOption.AVERAGE_PORESIZE}
                  onChange={bridgingOptionChange}
                  checked={mode === BridgingOption.AVERAGE_PORESIZE}
                />
                <Radio
                  label="Maximum poresize"
                  name="group"
                  value={BridgingOption.MAXIMUM_PORESIZE}
                  onChange={bridgingOptionChange}
                  checked={mode === BridgingOption.MAXIMUM_PORESIZE}
                />
              </RadioWrapper>

            <TextField
                label='Value'
              type="number"
              id="textfield-number"
              meta={unit}
              value={bridgeValue || 0}
              onChange={onBridgeValueChange}
              variant={bridgeValueVariant}
              helperText={bridgeValueHelperText}
            />
          <Button onClick={()=>clearBridges()}>Clear Bridges</Button>

        </InputWrapper>
          <BridgeGraph bridgeAndCombinations={userBridges} sizeFractions={sizeFractions} />
        </BridgeWrapper>
  )
}
