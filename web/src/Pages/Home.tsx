import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ErrorToast } from '../Components/Common/Toast'
import { MainBody } from '../Components/MainBody'
import { Navbar } from '../Components/Navbar/Navbar'
import { useApi } from '../lib/hooks/useApi'
import type { Products } from '../lib/types'

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  padding-right: 1rem;
  font-family: 'Equinor';
`

export function Home() {
  const [products, setProducts] = useState<Products>({})
  const appInsights = useAppInsightsContext()
  const { getProducts } = useApi()

  useEffect(() => {
    appInsights.trackEvent({ name: 'Main page load', properties: {} })
  }, [appInsights])

  // On first render, fetch all products
  useEffect(() => {
    getProducts()
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
        <MainBody products={products} />
      </BodyWrapper>
    </>
  )
}
