// @ts-ignore
import React, { ReactElement, useContext, useEffect, useState } from 'react'
// @ts-ignore
import styled from 'styled-components'
// @ts-ignore
import { Button, Icon, TopBar, Typography } from '@equinor/eds-core-react'

import RefreshButton from '../Components/RefreshButton'
import { ProductsAPI } from '../Api'
import CombinationsWrapper from '../Components/CombinationsWrapper'
import { Products } from '../Types'
import { ErrorToast } from '../Components/Common/Toast'
import { AuthContext } from '../Context'
import { ContactButton } from '../Components/ContactButton'

// @ts-ignore
import { filter_alt, info_circle } from '@equinor/eds-icons'

Icon.add({ filter_alt, info_circle })

const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 3%;
  padding-right: 3%;
  font-family: 'Equinor';
`
const StyledLink = styled.a`
  color: #007079;
  font-size: 16px;
  line-height: 20px;
  text-decoration-line: underline;
`

export default (): ReactElement => {
  const [products, setProducts] = useState<Products>({})
  const apiToken: string = useContext(AuthContext).token

  // On first render, fetch all products
  useEffect(() => {
    ProductsAPI.getProductsApi(apiToken)
      .then(response => {
        setProducts(response.data)
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(error)
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
              <StyledLink href={'https://statoilsrm.sharepoint.com/sites/LCMlibrary/Lists/Product'}>
                <Button variant='outlined'>
                  <Icon name='info_circle' title='info_circle' />
                  Products summary
                </Button>
              </StyledLink>
            </div>
            <div>
              <ContactButton />
            </div>
          </div>
        </TopBar.Actions>
      </TopBar>
      <Body>
        {/* @ts-ignore*/}
        <CombinationsWrapper products={products} />
      </Body>
    </>
  )
}
