import { OptimizerAPI } from '../../Api'
import PillInput, { Pill } from './PillInput'
import { Environmental, Weight, WeightOptions } from './WeightOptions'
import React, { ReactElement, useContext, useState } from 'react'
// @ts-ignore
import { CircularProgress, Typography } from '@equinor/eds-core-react'
import { AuthContext } from '../../Auth/AuthProvider'
import { Products } from '../../Types'

interface OptimizationContainerProps {
  isLoading: boolean
  setIsLoading: Function
  products: Products
  enabledProducts: Array<string>
  mode: string
  value: number
  handleUpdate: Function
}

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
  const [pill, setPill] = useState<Pill>({
    volume: 10,
    density: 350,
    mass: 3500,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [weight, setWeight] = useState<Weight>({
    fit: 5,
    co2: 0,
    cost: 0,
    mass: 5,
    environmental: [Environmental.GREEN, Environmental.BLACK, Environmental.RED, Environmental.YELLOW],
  })

  const apiToken: string = useContext(AuthContext)?.token

  const handleOptimize = () => {
    if (enabledProducts.length === 0) {
      alert('Select at least 1 product before running the optimizer')
      return null
    }
    setLoading(true)
    OptimizerAPI.postOptimizerApi(apiToken, {
      request: 'OPTIMAL_MIX',
      name: 'Optimal Blend',
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
      })
  }

  return (
    <div>
      <Typography variant="h3" style={{ paddingBottom: '2rem' }}>
        Optimizer
      </Typography>
      <PillInput pill={pill} setPill={setPill} isLoading={isLoading} handleOptimize={handleOptimize} />
      {loading && <CircularProgress style={{ padding: '20% 30%' }} />}
      {failedRun && <p style={{ color: 'red' }}>Failed to run the optimizer</p>}
      {/* Disabled until supported in API and the needed data is available*/}
      {/*<WeightOptions weight={weight} setWeight={setWeight} isLoading={isLoading} />*/}
    </div>
  )
}

export default OptimizationRunner
