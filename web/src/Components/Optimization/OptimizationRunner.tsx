import { OptimizerAPI } from '../../Api'
import PillInput, { Pill } from './PillInput'
import { Weight, WeightOptions } from './WeightOptions'
import React, { ReactElement, useContext, useState } from 'react'
// @ts-ignore
import { Accordion, Button, CircularProgress, TextField, Typography } from '@equinor/eds-core-react'
import { Products } from '../../Types'
import styled from 'styled-components'
import { Tooltip } from '../Common/Tooltip'
import { ErrorToast } from '../Common/Toast'
import { AuthContext, ParticleSizeContext } from '../../Context'
import EditProducts from '../Common/EditProducts'
import useLocalStorage from '../../Hooks'
import Icon from '../../Icons'

const { AccordionItem, AccordionHeader, AccordionPanel } = Accordion

interface OptimizationContainerProps {
  allProducts: Products
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

const InputWrapper = styled.div`
  padding: 0 15px 0 0;
  margin: 0 15px 0 0;
`

const OptimizationRunner = ({ mode, value, handleUpdate, allProducts }: OptimizationContainerProps): ReactElement => {
  const [failedRun, setFailedRun] = useState<boolean>(false)
  const [invalidInput, setInvalidInput] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const apiToken: string = useContext(AuthContext)?.token
  const [iterations, setIterations] = useState<number>(2000)
  const [maxProducts, setMaxProducts] = useState<number>(999)
  const [pill, setPill] = useState<Pill>({
    volume: 10,
    density: 350,
    mass: 3500,
  })
  const [weight, setWeight] = useState<Weight>({
    bridge: 5,
    mass: 5,
    products: 5,
  })
  const particleRange = useContext(ParticleSizeContext)

  const [products, setProducts] = useLocalStorage<any>('optimizerProducts', {})

  const handleOptimize = () => {
    setLoading(true)
    OptimizerAPI.postOptimizerApi(apiToken, {
      request: 'OPTIMAL_MIX',
      name: 'Optimal Blend',
      iterations: iterations,
      particleRange: [particleRange.from, particleRange.to],
      maxProducts: maxProducts,
      value: value,
      option: mode,
      mass: pill.mass,
      products: products,
      weights: weight,
    })
      .then(response => {
        setFailedRun(false)
        setLoading(false)
        handleUpdate(response.data)
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        setLoading(false)
        setFailedRun(true)
      })
  }

  return (
    <Wrapper>
      <Typography variant='h3' style={{ paddingBottom: '2rem' }}>
        Optimizer
      </Typography>
      <div style={{ display: 'flex' }}>
        <InputWrapper>
          <Typography variant='body_short'>Pill</Typography>
          <PillInput pill={pill} setPill={setPill} isLoading={loading} setInvalidInput={setInvalidInput} />
        </InputWrapper>
        <InputWrapper>
          <Typography variant='body_short'>Products</Typography>
          <div
            style={{
              border: '1px solid #DCDCDC',
              maxHeight: '300px',
              minHeight: '100px',
              overflow: 'auto',
              margin: '10px 0',
            }}>
            {Object.values(products).map((product: any) => {
              return (
                <Typography key={product.id} variant='body_short'>
                  {product.title}
                </Typography>
              )
            })}
          </div>
          <EditProducts allProducts={allProducts} enabledProducts={products} setEnabledProducts={setProducts} />
        </InputWrapper>
        <InputWrapper>
          <Typography variant='body_short'>Optimzier</Typography>
          <Accordion style={{ paddingTop: '10px' }}>
            <AccordionItem>
              <AccordionHeader>Advanced options</AccordionHeader>
              <AccordionPanel>
                <div style={{ display: 'flex' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ paddingBottom: '10px', maxWidth: '130px' }}>
                      <Tooltip text={'Number of iterations the optimizer will run.'}>
                        <TextField
                          type='number'
                          variant={(iterations <= 0 && 'error') || undefined}
                          label='Number of iterations'
                          id='interations'
                          value={iterations}
                          onChange={(event: any) => {
                            if (event.target.value === '') setIterations(0)
                            const newValue = parseInt(event.target.value)
                            if (Math.sign(newValue) >= 0) setIterations(newValue)
                          }}
                          disabled={loading}
                        />
                      </Tooltip>
                    </div>
                    <div style={{ paddingBottom: '10px', maxWidth: '130px' }}>
                      <Tooltip
                        text={'Maximum number of products the optimizer should try to include in the combination'}>
                        <TextField
                          type='number'
                          label='Max number of products'
                          id='maxProducts'
                          value={maxProducts}
                          onChange={(event: any) => {
                            if (event.target.value === '') setMaxProducts(0)
                            const newValue = parseInt(event.target.value)
                            if (Math.sign(newValue) >= 0) setMaxProducts(newValue)
                          }}
                          disabled={loading}
                        />
                      </Tooltip>
                    </div>
                    <div style={{ margin: '10px 0' }}>
                      <Tooltip text={'A range in microns which should be considered in the optimization'}>
                        <Typography variant='body_short'>Particle sizes to consider</Typography>
                      </Tooltip>
                    </div>
                    <ParticleSizeContext.Consumer>
                      {({ from, to, setRange }) => (
                        <div style={{ display: 'flex' }}>
                          <div style={{ padding: '0 15px', width: '100px' }}>
                            <TextField
                              id='part-from'
                              type='number'
                              label='From'
                              meta='μm'
                              value={from}
                              onChange={(event: any) => {
                                if (event.target.value === '') setRange([0, to])
                                const newValue = parseFloat(event.target.value)
                                if (Math.sign(newValue) >= 0) setRange([newValue, to])
                              }}
                              disabled={loading}
                            />
                          </div>
                          <div style={{ padding: '0 15px', width: '100px' }}>
                            <TextField
                              id='part-to'
                              type='number'
                              label='To'
                              meta='μm'
                              value={to}
                              onChange={(event: any) => {
                                if (event.target.value === '') setRange([from, 0])
                                const newValue = parseFloat(event.target.value)
                                if (Math.sign(newValue) >= 0) setRange([from, newValue])
                              }}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      )}
                    </ParticleSizeContext.Consumer>
                  </div>
                  <WeightOptions weight={weight} setWeight={setWeight} />
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </InputWrapper>
      </div>
      <div style={{ display: 'flex', padding: '16px 0' }}>
        <Button onClick={() => handleOptimize()} disabled={loading || invalidInput || iterations <= 0}>
          <Icon name='play' title='play' />
          Run optimizer
        </Button>
        {loading && <CircularProgress style={{ padding: '0 15px', height: '35px', width: '35px' }} />}
      </div>

      {failedRun && <p style={{ color: 'red' }}>Failed to run the optimizer</p>}
    </Wrapper>
  )
}

export default OptimizationRunner
