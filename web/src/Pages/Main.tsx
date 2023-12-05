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
import { AuthContext } from 'react-oauth2-code-pkce'
import { ContactButton } from '../Components/ContactButton'
import { IAuthContext } from 'react-oauth2-code-pkce'
import { info_circle, open_in_browser } from '@equinor/eds-icons'

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
  const { token }: IAuthContext = useContext(AuthContext)

  // On first render, fetch all products
  useEffect(() => {
    ProductsAPI.getProductsApi(token)
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
            }}
          >
            <div>
              <StyledLink
                href='https://statoilsrm.sharepoint.com/sites/LCMlibrary/Lists/Product'
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button variant='outlined'>
                  <Icon data={info_circle} title='info_circle' />
                  LCM Library SharePoint
                </Button>
              </StyledLink>
            </div>
            <RefreshButton />
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
