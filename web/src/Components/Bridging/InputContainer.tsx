import { Radio, TextField, Tooltip, Typography } from '@equinor/eds-core-react'
import { InputWrapper, RadioWrapper, StyledSelect } from './styles'
import { BridgingOption, CeramicDiscsValues } from '../../Enums'
import { findDValue } from '../../Utils'
import { GraphData } from '../../Types'
import { Variants } from '@equinor/eds-core-react/dist/types/components/types'

type InputContainerProps = {
  mode: BridgingOption
  onBridgeOptionChange: React.ChangeEventHandler<HTMLInputElement>
  onBridgeValueChange: (value: string) => void
  optimalBridgeGraphData: GraphData[]
  unit: string
  bridgeValue: number
  bridgeValueVariant: Variants | undefined
  bridgeValueHelperText: string
}

const InputContainer = ({
  mode,
  onBridgeOptionChange,
  onBridgeValueChange,
  optimalBridgeGraphData,
  unit,
  bridgeValue,
  bridgeValueVariant,
  bridgeValueHelperText,
}: InputContainerProps) => {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '0.5rem' }}>
      <InputWrapper>
        <Typography variant='h3'>Bridging options</Typography>
        <span>Bridging based on:</span>
        <RadioWrapper>
          <Radio
            label='Permeability'
            name='group'
            value={BridgingOption.PERMEABILITY}
            onChange={onBridgeOptionChange}
            checked={mode === BridgingOption.PERMEABILITY}
          />
          <Radio
            label='Average pore size/crack opening'
            name='group'
            value={BridgingOption.AVERAGE_PORESIZE}
            onChange={onBridgeOptionChange}
            checked={mode === BridgingOption.AVERAGE_PORESIZE}
          />
          <Tooltip
            title={
              'Max poresize/crack opening is the largest pore throat diameter or widest crack/aperture width (fracture width or screen slot opening)'
            }
          >
            <Radio
              label='Max pore size/crack opening'
              name='group'
              value={BridgingOption.MAXIMUM_PORESIZE}
              onChange={onBridgeOptionChange}
              checked={mode === BridgingOption.MAXIMUM_PORESIZE}
            />
          </Tooltip>
          <Radio
            label='Ceramic Discs'
            name='group'
            value={BridgingOption.CERAMIC_DISCS}
            onChange={onBridgeOptionChange}
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
                    <option value={value} key={index + value}>
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
      {optimalBridgeGraphData.length > 0 && (
        <div style={{ marginBlockStart: '3rem' }}>
          <Typography variant='h3'>Optimal Bridge:</Typography>
          <p>D10: {findDValue(optimalBridgeGraphData, 10, 'Bridge')}µ</p>
          <p>D50: {findDValue(optimalBridgeGraphData, 50, 'Bridge')}µ</p>
          <p>D90: {findDValue(optimalBridgeGraphData, 90, 'Bridge')}µ</p>
        </div>
      )}
    </div>
  )
}

export default InputContainer
