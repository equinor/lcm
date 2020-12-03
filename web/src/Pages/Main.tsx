// @ts-ignore
import React, { ReactElement, useContext, useEffect, useState } from 'react'
// @ts-ignore
import styled from 'styled-components'
// @ts-ignore
import { Button, Icon, SideSheet, TopBar, Typography } from '@equinor/eds-core-react'

import SelectProducts from '../Components/SelectProducts'
import RefreshButton from '../Components/RefreshButton'
import { ProductsAPI } from '../Api'
import CombinationsWrapper from '../Components/CombinationsWrapper'
import { Combination, Combinations, Products } from '../Types'
import { ErrorToast } from '../Components/Common/Toast'
import { AuthContext } from '../Context'
import { ContactButton } from '../Components/ContactButton'

// @ts-ignore
import { filter_alt } from '@equinor/eds-icons'
import useLocalStorage from '../Hooks'

Icon.add({ filter_alt })

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
  const [products, setProducts] = useState<Products>({})
  const [enabledProducts, setEnabledProducts] = useLocalStorage<any>('enabledProducts', [])
  const apiToken: string = useContext(AuthContext).token

  // On first render, fetch all products
  useEffect(() => {
    setIsLoading(true)
    ProductsAPI.getProductsApi(apiToken)
      .then(response => {
        setProducts(response.data)
        setIsLoading(false)
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(error)
        setIsLoading(false)
      })
  }, [])

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
              gridTemplateColumns: 'repeat(3, fit-content(100%))',
              gap: '16px',
            }}>
            <RefreshButton />
            <div>
              <Button variant='outlined' onClick={() => setSideSheet(!sideSheet)}>
                <Icon name='filter_alt' title='filter products' />
                Product filter
              </Button>
            </div>
            <div>
              <ContactButton />
            </div>
          </div>
        </TopBar.Actions>
      </TopBar>
      <Body>
        <SideSheet
          variant='large'
          title='Select products:'
          open={sideSheet}
          onClose={() => setSideSheet(false)}
          style={{ height: 'fit-content', minHeight: '100%' }}>
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
