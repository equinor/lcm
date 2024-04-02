import { useContext, useEffect, useState } from 'react'
import { FractionsAPI } from '../../Api'
import { BridgingOption, CeramicDiscsValues } from '../../Enums'
import { AuthContext } from 'react-oauth2-code-pkce'
import BridgeGraph from './BridgeGraph'
import { ErrorToast } from '../Common/Toast'
import InputContainer from './InputContainer'
import { findGraphData } from '../../Utils'

export default ({ bridges, mode, setMode, bridgeValue, setValue }) => {
  const [sizeFractions, setSizeFractions] = useState([])
  const [unit, setUnit] = useState('mD')
  const [bridgeValueHelperText, setBridgeValueHelperText] = useState(undefined)
  const [bridgeValueVariant, setBridgeValueVariant] = useState(undefined)
  const [optimalBridgeGraphData, setOptimalBridgeGraphData] = useState([])
  const { token } = useContext(AuthContext)

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

  function onBridgeOptionChange(event) {
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
    //<div style={{ display: 'flex' }}>
    <div>
      <InputContainer
        mode={mode}
        onBridgeOptionChange={onBridgeOptionChange}
        onBridgeValueChange={onBridgeValueChange}
        optimalBridgeGraphData={optimalBridgeGraphData}
        unit={unit}
        bridgeValue={bridgeValue}
        bridgeValueVariant={bridgeValueVariant}
        bridgeValueHelperText={bridgeValueHelperText}
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <BridgeGraph bridges={bridges} sizeFractions={sizeFractions} />
        <BridgeGraph bridges={bridges} sizeFractions={sizeFractions} />
      </div>
    </div>
  )
}
