// @ts-ignore
import React, { ReactElement, useContext, useEffect, useState } from 'react'
// @ts-ignore
import styled from 'styled-components'
// @ts-ignore
import { Button, Icon, SideSheet, TopBar, Typography } from '@equinor/eds-core-react'

import SelectProducts from './SelectProducts'
import RefreshButton from './RefreshButton'
import { ProductsAPI } from '../Api'
import CombinationsWrapper, { Combination, Combinations } from './CombinationsWrapper'
import { AuthContext } from '../Auth/AuthProvider'
import { Products } from '../Types'

const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 3%;
  padding-right: 3%;
  font-family: 'Equinor';
`

const defaultCombinations: Combinations = {}

const sackCombination: Combination = {
  name: 'Sack combination 1',
  sacks: true,
  values: {},
  cumulative: null,
}
defaultCombinations[sackCombination.name] = sackCombination

const manualCombination: Combination = {
  name: 'Manual combination 1',
  sacks: false,
  values: {},
  cumulative: null,
}
defaultCombinations[manualCombination.name] = manualCombination

export default (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [sideSheet, setSideSheet] = useState<boolean>(false)
  const storedEnabledProducts = JSON.parse(localStorage.getItem('enabledProducts') || '[]')
  const [products, setProducts] = useState<Products>({})
  const [enabledProducts, setEnabledProducts] = useState<Array<string>>(storedEnabledProducts || [])
  const apiToken: string = useContext(AuthContext).token

  // On first render, fetch all products
  useEffect(() => {
    setIsLoading(true)
    ProductsAPI.getProductsApi(apiToken)
      .then(response => {
        setProducts(response.data)
        setIsLoading(false)
      })
      .catch(e => {
        console.error(e)
        setIsLoading(false)
      })
  }, [])

  // Saved enabledProducts in localStorage
  useEffect(() => {
    localStorage.setItem('enabledProducts', JSON.stringify(enabledProducts))
  }, [enabledProducts])

  return (
    <>
      <TopBar>
        <TopBar.Header>
          <Typography variant='h2'>LCM Optimizer</Typography>
        </TopBar.Header>
        <TopBar.Actions>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, fit-content(100%))',
              gap: '16px',
            }}>
            <RefreshButton />
            <div>
              <Button variant='outlined' onClick={() => setSideSheet(!sideSheet)}>
                <Icon name='filter_alt' title='filter products' />
                Product filter
              </Button>
            </div>
          </div>
        </TopBar.Actions>
      </TopBar>
      <Body>
        <SideSheet variant='large' title='Select products:' open={sideSheet} onClose={() => setSideSheet(false)}>
          <SelectProducts
            loading={isLoading}
            products={products}
            enabledProducts={enabledProducts}
            setEnabledProducts={setEnabledProducts}
          />
        </SideSheet>
        <CombinationsWrapper
          enabledProducts={enabledProducts}
          products={products}
          defaultCombinations={defaultCombinations}
        />
      </Body>
    </>
  )
}
