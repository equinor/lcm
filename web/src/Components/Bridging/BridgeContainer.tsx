import type { Variants } from '@equinor/eds-core-react/dist/types/components/types'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { FractionsAPI } from '../../Api'
import { BridgingOption, CeramicDiscsValues } from '../../Enums'
import type { Bridge, GraphData } from '../../Types'
import { findGraphData } from '../../Utils'
import { ErrorToast } from '../Common/Toast'
import BridgeGraph from './Graphs/BridgeGraph'
import InputContainer from './InputContainer'
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
  const [bridgeValueHelperText, setBridgeValueHelperText] = useState<string>()
  const [bridgeValueVariant, setBridgeValueVariant] = useState<Variants>()
  const [optimalBridgeGraphData, setOptimalBridgeGraphData] = useState<GraphData[]>([])
  const [volumeData, setVolumeData] = useState<GraphData[]>([])
  const [cumulativeVolumeData, setCumulativeVolumeData] = useState<GraphData[]>([])
  const { token } = useContext(AuthContext)

  // Load size fractions once on first render
  useEffect(() => {
    FractionsAPI.getFractionsApi(token)
      .then((response) => {
        setSizeFractions(response.data.size_fractions)
      })
      .catch((error) => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(`fetch error ${error}`)
      })
  }, [])

  useEffect(() => {
    if (bridges.Bridge.length && sizeFractions.length) {
      setOptimalBridgeGraphData(findGraphData(sizeFractions, { Bridge: bridges.Bridge }))
    }
  }, [bridges, sizeFractions])

  function onBridgeOptionChange(event: React.ChangeEvent<HTMLInputElement>) {
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
        setValue(Number.parseInt(CeramicDiscsValues[0]))
        break
      default:
        return
    }
  }

  function onBridgeValueChange(value: string) {
    const newBridgeValue = Number.parseInt(value)
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
