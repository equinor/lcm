import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Radio, TextField, Typography, Button } from '@equinor/eds-core-react'
import BridgeGraph from './BridgeGraph.jsx'
import { FractionsAPI } from '../../Api'
import { BridgingOption } from "../../Enums"
import { ErrorToast } from "../Common/Toast"
import { AuthContext } from "../../Context"

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
    FractionsAPI.getFractionsApi(apiToken,)
      .then(response => {
        setSizeFractions(response.data.size_fractions)
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
      })
  }, [])

  return (
        <div style={{display: 'flex'}}>
        <InputWrapper>
            <Typography variant='h3'>Bridging options</Typography>
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
                  label="Average pore size/crack opening"
                  name="group"
                  value={BridgingOption.AVERAGE_PORESIZE}
                  onChange={bridgingOptionChange}
                  checked={mode === BridgingOption.AVERAGE_PORESIZE}
                />
                <Radio
                  label="Max pore size/crack opening"
                  name="group"
                  value={BridgingOption.MAXIMUM_PORESIZE}
                  onChange={bridgingOptionChange}
                  checked={mode === BridgingOption.MAXIMUM_PORESIZE}
                />
              </RadioWrapper>
            <div style={{width: '150px'}}>
              <TextField
                label='Value'
              type='number'
              id='textfield-number'
              meta={unit}
              value={bridgeValue || 0}
              onChange={onBridgeValueChange}
              variant={bridgeValueVariant}
              helperText={bridgeValueHelperText}
            />
            </div>

          <Button onClick={()=>clearBridges()} variant="outlined" style={{maxWidth: '130px'}}>Clear Bridges</Button>

        </InputWrapper>
          <BridgeGraph bridgeAndCombinations={userBridges} sizeFractions={sizeFractions} />
        </div>
  )
}
