import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Radio, TextField, Typography } from '@equinor/eds-core-react'
import { FractionsAPI } from '../../Api'
import { BridgingOption, CeramicDiscsValues } from "../../Enums"
import { ErrorToast } from "../Common/Toast"
import { AuthContext } from "../../Context"
import BridgeGraph from "./BridgeGraph"
import {findDValue, findGraphData} from "../../Utils";

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const RadioWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledSelect = styled.select`
  position: relative;
  font-size: medium;
  padding: 8px 16px;
  border: 1px solid #dbdbdb;
  cursor: pointer;
  width: 150px;
  background-color: #ffffff;
`

export default ({ bridges, mode, setMode, bridgeValue, setValue }) => {
  const [sizeFractions, setSizeFractions] = useState([])
  const [unit, setUnit] = useState('mD')
  const [bridgeValueHelperText, setBridgeValueHelperText] = useState(undefined)
  const [bridgeValueVariant, setBridgeValueVariant] = useState(undefined)
  const [optimalBridgeGraphData, setOptimalBridgeGraphData] = useState([])
  const apiToken = useContext(AuthContext).token

  // Load size fractions once on first render
  useEffect(() => {
    FractionsAPI.getFractionsApi(apiToken)
        .then(response => {
          setSizeFractions(response.data.size_fractions)
        })
        .catch(error => {
          ErrorToast(`${error.response.data}`, error.response.status)
          console.error('fetch error' + error)
        })
  }, [])

  useEffect(() => {
      if (bridges["Bridge"].length > 0 && sizeFractions.length > 0 ) {
      const x = (findGraphData(sizeFractions, {"Bridge": bridges["Bridge"]}))
      setOptimalBridgeGraphData(x)
        }
  }, [bridges, sizeFractions])

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
      case BridgingOption.CERAMIC_DISCS:
        setMode(BridgingOption.CERAMIC_DISCS)
        setUnit('microns')
        setValue(CeramicDiscsValues[0])
        break
      default:
        return
    }
  }

  function onBridgeValueChange(value) {
    const newBridgeValue = parseInt(value)
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

  console.log("b", bridges["Bridge"])

  return (
      <div style={{ display: 'flex' }}>
        <InputWrapper>
          <Typography variant="h3">Bridging options</Typography>
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
            <Radio
                label="Ceramic Discs"
                name="group"
                value={BridgingOption.CERAMIC_DISCS}
                onChange={bridgingOptionChange}
                checked={mode === BridgingOption.CERAMIC_DISCS}
            />
          </RadioWrapper>
          <div style={{ width: '150px' }}>
            {mode === BridgingOption.CERAMIC_DISCS ?
                <div style={{display: 'flex', flexDirection: "column"}}>
                  <label>Ceramic Discs Size</label>
                  <StyledSelect onChange={event =>onBridgeValueChange(event.target.value)}>
                    {CeramicDiscsValues.map((value)=>{
                      return <option value={value}>{value}</option>
                    })}
                  </StyledSelect>
                  <small style={{alignSelf: "flex-end"}}>microns</small>
                </div>
                :
                <TextField
                    label="Value"
                    type="number"
                    id="textfield-number"
                    meta={unit}
                    value={bridgeValue || 0}
                    onChange={event=>onBridgeValueChange(event.target.value)}
                    variant={bridgeValueVariant}
                    helperText={bridgeValueHelperText}
                />
            }

          </div>
        </InputWrapper>
        <BridgeGraph bridges={bridges} sizeFractions={sizeFractions}/>
        {optimalBridgeGraphData.length > 0 && <div>
          <p>Optimal bridge:</p>
          <p>D10: {findDValue(optimalBridgeGraphData, 10, "Bridge")}</p>
          <p>D50: {findDValue(optimalBridgeGraphData, 50, "Bridge")}</p>
          <p>D90: {findDValue(optimalBridgeGraphData, 90, "Bridge")}</p>
        </div>}
      </div>
  )
}
