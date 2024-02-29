import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Radio, TextField, Typography, Tabs } from '@equinor/eds-core-react'
import { FractionsAPI } from '../../Api'
import { BridgingOption, CeramicDiscsValues } from '../../Enums'
import { AuthContext } from 'react-oauth2-code-pkce'
import BridgeGraph from './BridgeGraph'
import { Tooltip } from '../Common/Tooltip'
import { findGraphData } from '../../Utils'
import { ErrorToast } from '../Common/Toast'

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 4px; 
  padding: 1rem; 
  gap: 10px 0px;
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
  const { token } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState(1)
  const handleChange = index => {
    setActiveTab(index)
  }

  // Load size fractions once on first render
  useEffect(() => {
    FractionsAPI.getFractionsApi(token)
      .then(response => {
        setSizeFractions(response.data.size_fractions)
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
      })
  }, [])

  useEffect(() => {
    if (bridges['Bridge'].length && sizeFractions.length) {
      const x = findGraphData(sizeFractions, { Bridge: bridges['Bridge'] })
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

  return (
    <div style={{ display: 'flex' }}>
      <InputWrapper>
        <Typography variant='h3'>Bridging options</Typography>
        <div>Bridging based on:</div>
        <RadioWrapper>
          <Radio
            label='Permeability'
            name='group'
            value={BridgingOption.PERMEABILITY}
            onChange={bridgingOptionChange}
            checked={mode === BridgingOption.PERMEABILITY}
          />
          <Radio
            label='Average pore size/crack opening'
            name='group'
            value={BridgingOption.AVERAGE_PORESIZE}
            onChange={bridgingOptionChange}
            checked={mode === BridgingOption.AVERAGE_PORESIZE}
          />
          <Tooltip
            text={
              'Max poresize/crack opening is the largest pore throat diameter or widest crack/aperture width (fracture width or screen slot opening)'
            }
          >
            <Radio
              label='Max pore size/crack opening'
              name='group'
              value={BridgingOption.MAXIMUM_PORESIZE}
              onChange={bridgingOptionChange}
              checked={mode === BridgingOption.MAXIMUM_PORESIZE}
            />
          </Tooltip>
          <Radio
            label='Ceramic Discs'
            name='group'
            value={BridgingOption.CERAMIC_DISCS}
            onChange={bridgingOptionChange}
            checked={mode === BridgingOption.CERAMIC_DISCS}
          />
        </RadioWrapper>
        <div style={{ width: '150px' }}>
          {mode === BridgingOption.CERAMIC_DISCS ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label>Ceramic Discs Size</label>
              <StyledSelect onChange={event => onBridgeValueChange(event.target.value)}>
                {CeramicDiscsValues.map((value, index) => {
                  return (
                    <option value={value} index={index + value}>
                      {value}
                    </option>
                  )
                })}
              </StyledSelect>
              <small style={{ alignSelf: 'flex-end' }}>microns</small>
            </div>
          ) : (
            <TextField
              label='Value'
              type='number'
              id='textfield-number'
              meta={unit}
              value={bridgeValue || 0}
              onChange={event => onBridgeValueChange(event.target.value)}
              variant={bridgeValueVariant}
              helperText={bridgeValueHelperText}
            />
          )}
        </div>
      </InputWrapper>
        <Tabs activeTab={activeTab} onChange={handleChange}>
          <Tabs.List>
            <Tabs.Tab>Cumulative</Tabs.Tab>
            <Tabs.Tab>Relative</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panels conditionalRender>
            <Tabs.Panel key={1}>
              <BridgeGraph bridges={bridges} sizeFractions={sizeFractions} />
            </Tabs.Panel>
            <Tabs.Panel key={2}>
              <BridgeGraph bridges={bridges} sizeFractions={sizeFractions} />
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
    </div>
  )
}
