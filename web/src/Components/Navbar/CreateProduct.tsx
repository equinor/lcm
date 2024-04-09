import React, { useContext, useState } from 'react'
// @ts-ignore
import { Button, Dialog, Icon, TextField, Table } from '@equinor/eds-core-react'

import { ProductsAPI } from '../../Api'
import styled from 'styled-components'
import { ErrorToast } from '../Common/Toast'
import { AuthContext } from 'react-oauth2-code-pkce'
import { IAuthContext } from 'react-oauth2-code-pkce'
import { upload } from '@equinor/eds-icons'
import { TNewProduct } from '../../Types'

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const parseCumulativeProductCurve = (curve: string): number[][] => {
  // Split the input string into lines using the newline character
  const lines = curve.split('\n')

  // Map each line into an array of two elements
  const parsedData = lines.map(line => {
    // Replace commas with periods to handle European-style decimals
    const cleanLine = line.replace(/,/g, '.')
    // Split each line by spaces or tabs to separate the numbers
    const elements = cleanLine.split(/\s+|\t+/)
    // Convert the string elements to numbers
    return elements.map(element => parseFloat(element))
  })

  return parsedData
}

export const RefreshButton = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { token }: IAuthContext = useContext(AuthContext)
  const [newProduct, setNewProduct] = useState<TNewProduct>()
  const [newProductData, setNewProductData] = useState<number[][]>([])

  const postProduct = () => {
    ProductsAPI.postProductsApi(token, { ...newProduct, productData: newProductData })
      .then(() => {
        setLoading(false)
        window.location.reload()
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
        setLoading(false)
      })
  }

  return (
    <>
      <Button variant='outlined' onClick={() => setDialogOpen(true)}>
        <Icon data={upload} title='refresh' />
        Create product
      </Button>
      <Dialog open={dialogOpen} isDismissable={true} style={{ width: 'min-content' }}>
        <Dialog.Header>
          <Dialog.Title>Define a new product</Dialog.Title>
        </Dialog.Header>
        <Dialog.CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0px', alignSelf: 'start' }}>
            <TextField
              style={{ padding: '10px 0' }}
              id='name'
              label='Product name'
              value={newProduct?.productName ?? ''}
              onChange={event => setNewProduct({ ...newProduct, productName: event.target.value })}
            />
            <TextField
              style={{ padding: '10px 0' }}
              id='supplier'
              label='Supplier name'
              value={newProduct?.productSupplier ?? ''}
              onChange={event => setNewProduct({ ...newProduct, productSupplier: event.target.value })}
            />
          </div>
          <div>
            <p>
              Paste the product's measured data values here. Make sure it's been parsed correctly by inspecting the
              table below before submitting.
            </p>
            <p>
              The format of the pasted data should be two numbers on each line (space or tab separated), where the first
              number is the fraction size in micron of the measuring point, and the other the cumulative volume
              percentage.
            </p>
            <p>
              The Optimizer requires each product to have 100 data points, from 0.01 - 3500 microns. If the data you
              provide is missing data, the values will be interpolated and extrapolated.
            </p>
            <TextField
              id='data'
              style={{ width: '500px', overflow: 'auto' }}
              placeholder='Paste the cumulative curve here'
              multiline
              rows={6}
              label='Cumulative fractions data'
              onChange={event => setNewProductData(parseCumulativeProductCurve(event.target.value))}
            />
          </div>
          <div style={{ maxHeight: '300px', overflow: 'auto', marginTop: '20px' }}>
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Cell>Index</Table.Cell>
                  <Table.Cell>Fraction(micron)</Table.Cell>
                  <Table.Cell>Cumulative</Table.Cell>
                </Table.Row>
              </Table.Head>
              {newProductData.map((dataPoint: any, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{index} </Table.Cell>
                  <Table.Cell>{dataPoint[0]} </Table.Cell>
                  <Table.Cell>{dataPoint[1]} </Table.Cell>
                </Table.Row>
              ))}
            </Table>
          </div>
        </Dialog.CustomContent>
        <Dialog.Actions style={{ width: 'fill-available', display: 'flex', justifySelf: 'normal' }}>
          <ButtonWrapper>
            <Button variant='outlined' onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              disabled={loading || !newProductData || !newProduct?.productSupplier || !newProduct?.productName}
              onClick={() => {
                setLoading(true)
                postProduct()
              }}
            >
              Create
            </Button>
          </ButtonWrapper>
        </Dialog.Actions>
      </Dialog>
    </>
  )
}

export default RefreshButton
