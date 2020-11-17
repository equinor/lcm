import { OptimizerAPI } from '../../Api'
import PillInput, { Pill } from './PillInput'
import { Environmental, Weight } from './WeightOptions'
import React, { ReactElement, useContext, useState } from 'react'
// @ts-ignore
import { CircularProgress, Typography, Button, Switch, TextField } from '@equinor/eds-core-react'
import { AuthContext } from '../../Auth/AuthProvider'
import { Products } from '../../Types'
import styled from 'styled-components'

interface OptimizationContainerProps {
  isLoading: boolean
  setIsLoading: Function
  products: Products
  enabledProducts: Array<string>
  mode: string
  value: number
  handleUpdate: Function
}

const Wrapper = styled.div`
  padding: 10px 0 10px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
  width: fit-content;
`

const getWeightPercentages = (weight: Weight) => {
  const { fit, co2, cost, mass } = weight
  let sum: number = fit + co2 + cost + mass
  return {
    best_fit: 100 * (fit / sum),
    mass_fit: 100 * (mass / sum),
    co2: 100 * (co2 / sum),
    cost: 100 * (cost / sum),
  }
}

const OptimizationRunner = ({
  isLoading,
  enabledProducts,
  mode,
  value,
  handleUpdate,
}: OptimizationContainerProps): ReactElement => {
  const [failedRun, setFailedRun] = useState<boolean>(false)
  const [invalidInput, setInvalidInput] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const apiToken: string = useContext(AuthContext)?.token
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false)
  const [iterations, setIterations] = useState<number>(300)
  const [maxProducts, setMaxProducts] = useState<number>(0)
  const [pill, setPill] = useState<Pill>({
    volume: 10,
    density: 350,
    mass: 3500,
  })
  const [weight, setWeight] = useState<Weight>({
    fit: 5,
    co2: 0,
    cost: 0,
    mass: 5,
    environmental: [Environmental.GREEN, Environmental.BLACK, Environmental.RED, Environmental.YELLOW],
  })

  const handleOptimize = () => {
    if (enabledProducts.length === 0) {
      alert('Select at least 1 product before running the optimizer')
      return null
    }
    setLoading(true)
    OptimizerAPI.postOptimizerApi(apiToken, {
      request: 'OPTIMAL_MIX',
      name: 'Optimal Blend',
      iterations: iterations,
      maxProducts: maxProducts,
      value: value,
      option: mode,
      mass: pill.mass,
      environmental: weight.environmental,
      products: enabledProducts,
      weights: getWeightPercentages(weight),
    })
      .then(response => {
        setFailedRun(false)
        setLoading(false)
        handleUpdate(response.data)
      })
      .catch(error => {
        console.log(error)
        setLoading(false)
        setFailedRun(true)
        if (error.response.status === 400) alert(error.response.data)
        if (error.response.status === 401) alert(error.response.data)
      })
  }

  return (
    <Wrapper>
      <Typography variant="h3" style={{ paddingBottom: '2rem' }}>
        Optimizer
      </Typography>
      <PillInput pill={pill} setPill={setPill} isLoading={isLoading} setInvalidInput={setInvalidInput} />
      <Switch label={'Advanced options'} onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} />
      {showAdvancedOptions && (
        <div style={{ paddingBottom: '10px' }}>
          <TextField
            type="number"
            variant={(iterations <= 0 && 'error') || undefined}
            label="Number of iterations"
            id="interations"
            value={iterations}
            onChange={(event: any) => {
              if (event.target.value === '') setIterations(0)
              const newValue = parseInt(event.target.value)
              if (Math.sign(newValue) >= 0) setIterations(newValue)
            }}
            disabled={isLoading}
          />
          <TextField
            type="number"
            label="Max number of products"
            id="maxProducts"
            value={maxProducts}
            onChange={(event: any) => {
              if (event.target.value === '') setMaxProducts(0)
              const newValue = parseInt(event.target.value)
              if (Math.sign(newValue) >= 0) setMaxProducts(newValue)
            }}
            disabled={isLoading}
          />
        </div>
      )}
      <Button onClick={() => handleOptimize()} disabled={isLoading || invalidInput || iterations <= 0}>
        Run optimizer
      </Button>
      {loading && <CircularProgress style={{ padding: '20% 30%' }} />}
      {failedRun && <p style={{ color: 'red' }}>Failed to run the optimizer</p>}
      {/* Disabled until supported in API and the needed data is available*/}
      {/*<WeightOptions weight={weight} setWeight={setWeight} isLoading={isLoading} />*/}
    </Wrapper>
  )
}

export default OptimizationRunner
