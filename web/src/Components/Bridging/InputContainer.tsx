import { NativeSelect, Radio, TextField, Tooltip, Typography } from '@equinor/eds-core-react'
import type { Variants } from '@equinor/eds-core-react/dist/types/components/types'
import { BridgingOption, CeramicDiscsValues } from '../../Enums'
import type { GraphData } from '../../Types'
import { findDValue } from '../../Utils'
import { colors } from '../../colors'
import { InputWrapper, RadioWrapper } from './styles'

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

const InputLabels: { [key in BridgingOption]: string } = {
  [BridgingOption.PERMEABILITY]: 'Permeability',
  [BridgingOption.AVERAGE_PORESIZE]: 'Avg. Pore Size',
  [BridgingOption.MAXIMUM_PORESIZE]: 'Max Pore Size',
  [BridgingOption.CERAMIC_DISCS]: 'Disk Size',
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
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '0.5rem',
      }}
    >
      <InputWrapper>
        <div
          style={{
            width: '180px',
            border: '1px solid rgb(220, 220, 220)',
            borderRadius: '0.5rem',
            backgroundColor: `${colors.background}`,
            padding: '0.5rem',
          }}
        >
          <Typography variant="h3">Bridging options</Typography>
          <span>Bridging based on:</span>
          <RadioWrapper>
            <Radio
              label="Permeability"
              name="group"
              value={BridgingOption.PERMEABILITY}
              onChange={onBridgeOptionChange}
              checked={mode === BridgingOption.PERMEABILITY}
            />
            <Radio
              label="Average pore size/crack opening"
              name="group"
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
                label="Max pore size/crack opening"
                name="group"
                value={BridgingOption.MAXIMUM_PORESIZE}
                onChange={onBridgeOptionChange}
                checked={mode === BridgingOption.MAXIMUM_PORESIZE}
              />
            </Tooltip>
            <Radio
              label="Ceramic Discs"
              name="group"
              value={BridgingOption.CERAMIC_DISCS}
              onChange={onBridgeOptionChange}
              checked={mode === BridgingOption.CERAMIC_DISCS}
            />
          </RadioWrapper>
          <div style={{ width: '100%', margin: 'auto' }}>
            {mode === BridgingOption.CERAMIC_DISCS ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* <label htmlFor='ceramic-disk-selector'>Ceramic Discs Size</label> */}
                <NativeSelect
                  onChange={(event) => onBridgeValueChange(event.target.value)}
                  id={'ceramic-disk-selector'}
                  label={'Disk Size'}
                  meta={'microns'}
                >
                  {CeramicDiscsValues.map((value, index) => {
                    return (
                      <option value={value} key={index + value}>
                        {value}
                      </option>
                    )
                  })}
                </NativeSelect>
                {/* <small style={{ alignSelf: 'flex-end' }}>microns</small> */}
              </div>
            ) : (
              <TextField
                label={InputLabels[mode]}
                type="number"
                id="textfield-number"
                meta={unit}
                value={bridgeValue || 0}
                onChange={(event) => onBridgeValueChange(event.target.value)}
                variant={bridgeValueVariant}
                helperText={bridgeValueHelperText}
              />
            )}
          </div>
        </div>
      </InputWrapper>
      {optimalBridgeGraphData.length > 0 && (
        <div
          style={{
            marginBlockStart: '2rem',
            width: '180px',
            border: '1px solid rgb(220, 220, 220)',
            borderRadius: '0.5rem',
            backgroundColor: `${colors.background}`,
            padding: '0.5rem',
          }}
        >
          <Typography variant="h3">Optimal Bridge:</Typography>
          <div style={{ marginInlineStart: '0.5rem' }}>
            {[10, 50, 90].map((d) => (
              <p key={d}>
                D{d}: {findDValue(optimalBridgeGraphData, d, 'Bridge')}
                {'\u00B5m'}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default InputContainer
