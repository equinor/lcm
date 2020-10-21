import { Product } from '../../gen-api/src/models'
import { Combination } from '../../Pages/Main'
import { OptimizerAPI } from '../../Api'
import PillInput, { Pill } from './PillInput'
import { Environmental, Weight, WeightOptions } from './WeightOptions'
import React, { ReactElement, useContext, useState } from 'react'
// @ts-ignore
import { CircularProgress, Typography } from '@equinor/eds-core-react'
import { AuthContext } from '../../Auth/Auth'

interface OptimizationContainerProps {
  isLoading: boolean
  setIsLoading: Function
  products: Map<string, Product>
  enabledProducts: Array<string>
  combinationMap: Map<string, Combination>
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
  setIsLoading,
  enabledProducts,
  combinationMap,
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

  const [weight, setWeight] = useState<Weight>({
    fit: 5,
    co2: 0,
    cost: 0,
    mass: 5,
    environmental: [Environmental.GREEN, Environmental.BLACK, Environmental.RED, Environmental.YELLOW],
  })

  const apiToken: string = useContext(AuthContext).jwtIdToken

  function getOptimalBlend() {
    if (enabledProducts.length === 0) {
      alert('Select at least 1 product before running the optimizer')
      return null
    }

    OptimizerAPI.postOptimizerApi(apiToken, {
      request: 'OPTIMAL_MIX',
      name: 'Optimal Blend',
      value: value,
      option: mode,
      mass: pill.mass,
      enviromental: weight.environmental,
      products: enabledProducts,
      weights: getWeightPercentages(weight),
    })
      .then(response => {
        setFailedRun(false)
        handleUpdate(response.data)
      })
      .catch(error => {
        setFailedRun(true)
        console.log(error.response.data)
      })
  }

  const handleOptimize = () => {
    let countSackCombinations = 0
    combinationMap.forEach(combination => {
      if (combination.sacks) {
        countSackCombinations += 1
      }
    })
    if (countSackCombinations < 5) {
      // setIsLoading(true)
      getOptimalBlend()
    } else {
      alert('The optimizer can only run with a maximum of 5 sack combinations')
    }
  }

  return (
    <>
      <div>
        <Typography variant="h2" style={{ paddingBottom: '2rem' }}>
          Optimizer
        </Typography>
        <PillInput pill={pill} setPill={setPill} isLoading={isLoading} handleOptimize={handleOptimize} />
        {isLoading && <CircularProgress style={{ padding: '20% 30%' }} />}
        {failedRun && <p style={{ color: 'red' }}>Failed to run the optimizer</p>}
      </div>
      <div>
        <WeightOptions weight={weight} setWeight={setWeight} isLoading={isLoading} />
      </div>
    </>
  )
}

export default OptimizationRunner
