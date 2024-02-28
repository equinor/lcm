import { useContext, useEffect, useState } from 'react'
import { FractionsAPI } from '../../Api'
import { BridgingOption, CeramicDiscsValues } from '../../Enums'
import { AuthContext } from 'react-oauth2-code-pkce'
import { ErrorToast } from '../Common/Toast'
import InputContainer from './InputContainer'
import { findGraphData } from '../../Utils'
import { Bridge, GraphData } from '../../Types'
import BridgeGraph from './Graphs/BridgeGraph'
import { differentiateArrayObjects } from './utils'

type BridgeContainerProps = {
  bridges: Bridge
  mode: BridgingOption
  setMode: (mode: BridgingOption) => void
  bridgeValue: number
  setValue: (value: number) => void
}

export default ({ bridges, mode, setMode, bridgeValue, setValue }: BridgeContainerProps) => {
  const [sizeFractions, setSizeFractions] = useState([])
  const [unit, setUnit] = useState('mD')
  const [bridgeValueHelperText, setBridgeValueHelperText] = useState(undefined)
  const [bridgeValueVariant, setBridgeValueVariant] = useState(undefined)
  const [optimalBridgeGraphData, setOptimalBridgeGraphData] = useState([])
  const [volumeData, setVolumeData] = useState([])
  const [cumulativeVolumeData, setCumulativeVolumeData] = useState([])
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
        setValue(parseInt(CeramicDiscsValues[0]))
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

  useEffect(() => {
    const cumulative = findGraphData(sizeFractions, bridges)
    const differentiated = differentiateArrayObjects(cumulative)
    setCumulativeVolumeData(cumulative)
    setVolumeData(differentiated)
  }, [sizeFractions, bridges])

  return (
    <div style={{ overflow: 'auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'white',
          overflow: 'auto',
          padding: '0.5rem',
          borderRadius: '0.5rem',
        }}
      >
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
        <BridgeGraph
          graphData={cumulativeVolumeData}
          title={'Cumulative Frequency'}
          sizeFractions={sizeFractions}
          bridges={bridges}
        />
        <BridgeGraph
          graphData={volumeData}
          title={'Relative Frequency'}
          sizeFractions={sizeFractions}
          bridges={bridges}
          showBridge={false}
        />
      </div>
    </div>
  )
}
