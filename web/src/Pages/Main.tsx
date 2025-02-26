import { type ReactElement, useContext, useEffect, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import type { IAuthContext } from 'react-oauth2-code-pkce'

import styled from 'styled-components'

import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { ProductsAPI } from '../Api'
import { ErrorToast } from '../Components/Common/Toast'
import Body from '../Components/MainBody'
import Navbar from '../Components/Navbar/Navbar'
import type { Products } from '../Types'

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  padding-right: 1rem;
  font-family: 'Equinor';
`

export default (): ReactElement => {
  const [products, setProducts] = useState<Products>({})
  const { token }: IAuthContext = useContext(AuthContext)

  const appInsights = useAppInsightsContext()

  useEffect(() => {
    appInsights.trackEvent(AuthContext)
    }, [appInsights])

  // On first render, fetch all products
  useEffect(() => {
    ProductsAPI.getProductsApi(token)
      .then((response) => {
        setProducts(response.data)
      })
      .catch((error) => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(error)
      })
  }, [])

  return (
    <>
      <Navbar />
      <BodyWrapper>
        <Body products={products} />
      </BodyWrapper>
    </>
  )
}
