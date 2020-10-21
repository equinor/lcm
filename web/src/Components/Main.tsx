// @ts-ignore
import React, { ReactElement, useContext, useEffect, useState } from 'react'
// @ts-ignore
import styled from 'styled-components'
// @ts-ignore
import { Button, Icon, SideSheet, TopBar } from '@equinor/eds-core-react'

import SelectProducts from './SelectProducts'
import RefreshButton from './RefreshButton'
import { ProductsAPI } from '../Api'
import { Product } from '../gen-api/src/models'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
import { AuthContext } from '../Auth/Auth'
import CombinationsWrapper, { Combination, Combinations } from './CombinationsWrapper'

const Wrapper = styled.div`
  height: 100vh;
  overflow: auto;
`

const Body = styled.div`
  position: relative;
  background: #ebebeb;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  font-family: 'Equinor';
`

const defaultCombinations: Combinations = {}

const sackCombination: Combination = {
  id: uuidv4(),
  name: 'Sack combination 1',
  sacks: true,
  values: {},
  cumulative: null,
}
defaultCombinations[sackCombination.id] = sackCombination

const manualCombination: Combination = {
  id: uuidv4(),
  name: 'Manual combination 1',
  sacks: false,
  values: {},
  cumulative: null,
}
defaultCombinations[manualCombination.id] = manualCombination

export default (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [sideSheet, setSideSheet] = useState<boolean>(false)
  const storedEnabledProducts = JSON.parse(localStorage.getItem('enabledProducts') || '[]')
  const [products, setProducts] = useState<Map<string, Product>>(new Map())
  const [enabledProducts, setEnabledProducts] = useState<Array<string>>(storedEnabledProducts || [])
  const user = useContext(AuthContext)
  const apiToken: string = user?.jwtIdToken

  // On first render, fetch all products
  useEffect(() => {
    setIsLoading(true)
    ProductsAPI.getProductsApi(apiToken)
      .then(response => {
        let products = response.data.reduce((map: any, obj: Product) => ({ ...map, [obj.id]: obj }), {})
        setProducts(products)
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
    <Wrapper>
      <TopBar style={{ height: 'fit-content' }}>
        <RefreshButton />
        <div>
          <Button variant="outlined" onClick={() => setSideSheet(!sideSheet)}>
            <Icon name="filter_alt" title="filter products" />
            Product filter
          </Button>
        </div>
      </TopBar>

      <Body>
        <SideSheet variant="large" title="Select products:" open={sideSheet} onClose={() => setSideSheet(false)}>
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
    </Wrapper>
  )
}
