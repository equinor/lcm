// @ts-ignore
import { ReactElement, useContext, useEffect, useState } from 'react'
// @ts-ignore
import styled from 'styled-components'
// @ts-ignore
import { ProductsAPI } from '../Api'
import Body from '../Components/MainBody'
import { Products } from '../Types'
import { ErrorToast } from '../Components/Common/Toast'
import { AuthContext } from 'react-oauth2-code-pkce'
import { IAuthContext } from 'react-oauth2-code-pkce'
import Navbar from '../Components/Navbar/Navbar'
import ErrorBoundary from '../Components/Common/ErrorBoundary'

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
      <ErrorBoundary>
        <Navbar />
        <BodyWrapper>
          {/* @ts-ignore*/}
          <Body products={products} />
        </BodyWrapper>
      </ErrorBoundary>
    </>
  )
}
