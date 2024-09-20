import React, { useContext, useState } from 'react'
// @ts-ignore
import { Button, Dialog, Icon, Table, Tabs, TextField } from '@equinor/eds-core-react'

import { ProductsAPI } from '../../Api'
import styled from 'styled-components'
import { ErrorToast } from '../Common/Toast'
import { AuthContext, IAuthContext } from 'react-oauth2-code-pkce'
import { upload } from '@equinor/eds-icons'
import { TNewProduct } from '../../Types'
import { toast } from 'react-toastify'

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

  // Filter out bad input
  return parsedData.filter(dataPoint => {
    if (dataPoint.length !== 2) return false
    return !Number.isNaN(dataPoint[0]) && !Number.isNaN(dataPoint[1])
  })
}

export const RefreshButton = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { token }: IAuthContext = useContext(AuthContext)
  const [newProduct, setNewProduct] = useState<TNewProduct>()
  const [newProductData, setNewProductData] = useState<number[][]>([])
  const [activeTab, setActiveTab] = useState<number>(0)

  const postProduct = () => {
    ProductsAPI.postProductsApi(token, { ...newProduct, productData: newProductData })
      .then(() => {
        setDialogOpen(false)
        setLoading(false)
        toast.success('Product created. Reloading page...')
        setTimeout(() => window.location.reload(), 2000)
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
        setLoading(false)
      })
  }

  return (
    <div>
      <div onClick={() => setDialogOpen(true)} style={{ display: 'flex', alignItems: 'center' }}>
        <Icon data={upload} title='refresh' />
        <div style={{ paddingLeft: '15px' }}>Create product</div>
      </div>
      <Dialog open={dialogOpen} isDismissable={true} style={{ width: 'min-content' }}>
        <Dialog.Header>
          <Dialog.Title>Define a new product</Dialog.Title>
        </Dialog.Header>
        <Dialog.CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
          <Tabs activeTab={activeTab} onChange={e => setActiveTab(e)}>
            <Tabs.List>
              <Tabs.Tab>Details</Tabs.Tab>
              <Tabs.Tab>Verify</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panels>
              <Tabs.Panel>
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
                  <p>Paste the product's measured data values here.</p>
                  <p>
                    The format of the pasted data should be two numbers on each line (space or tab separated), where the
                    first number is the fraction size in micron of the measuring point, and the other the cumulative
                    volume percentage.
                  </p>
                  <p>
                    The Optimizer requires each product to have 100 data points, from 0.01 - 3500 microns. If the data
                    you provide is missing data, the values will be interpolated and extrapolated.
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
              </Tabs.Panel>
              <Tabs.Panel>
                <p>Verify that the data looks correct before submitting. Go back and correct the input if necessary.</p>
                <div style={{ maxHeight: '300px', overflow: 'auto', marginTop: '20px' }}>
                  <Table>
                    <Table.Head>
                      <Table.Row>
                        <Table.Cell>Index</Table.Cell>
                        <Table.Cell>Fraction(micron)</Table.Cell>
                        <Table.Cell>Cumulative(%)</Table.Cell>
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
              </Tabs.Panel>
            </Tabs.Panels>
          </Tabs>
        </Dialog.CustomContent>
        <Dialog.Actions style={{ width: 'fill-available', display: 'flex', justifySelf: 'normal' }}>
          <ButtonWrapper>
            {activeTab === 0 ? (
              <Button variant='outlined' onClick={() => setDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
            ) : (
              <Button variant='outlined' onClick={() => setActiveTab(0)}>
                Back
              </Button>
            )}
            {activeTab === 0 ? (
              <Button onClick={() => setActiveTab(1)}>Next</Button>
            ) : (
              <Button
                disabled={loading || !newProductData || !newProduct?.productSupplier || !newProduct?.productName}
                onClick={() => {
                  setLoading(true)
                  postProduct()
                }}
              >
                Create
              </Button>
            )}
          </ButtonWrapper>
        </Dialog.Actions>
      </Dialog>
    </div>
  )
}

export default RefreshButton
