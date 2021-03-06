import React, { ReactElement, useEffect, useState } from 'react'
// @ts-ignore
import { Button, Dialog, Icon, Scrim } from '@equinor/eds-core-react'
import SelectProducts from '../SelectProducts'
import { Products } from '../../Types'

const { Actions, Title, CustomContent } = Dialog

interface AddProductsProps {
  allProducts: Products
  enabledProducts: Products
  setEnabledProducts: Function
}

export const EditProducts = ({ allProducts, enabledProducts, setEnabledProducts }: AddProductsProps): ReactElement => {
  const [scrim, setScrim] = useState<boolean>(false)
  const [selectedProducts, setSelectedProducts] = useState<Products>(enabledProducts)

  useEffect(() => {
    setSelectedProducts(enabledProducts)
  }, [enabledProducts])

  return (
    <>
      <Button variant='outlined' onClick={() => setScrim(true)}>
        <Icon name='edit' title='edit' />
        Select products
      </Button>
      {scrim && (
        <Scrim onClose={() => setScrim(false)}>
          <Dialog style={{ width: 'min-content' }}>
            <Title>Select products in blend</Title>
            <CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
              <SelectProducts
                allProducts={allProducts}
                enabledProducts={selectedProducts}
                setEnabledProducts={setSelectedProducts}
              />
            </CustomContent>
            <Actions style={{ width: 'fill-available', display: 'flex', justifySelf: 'center' }}>
              <Button
                style={{ width: '200px' }}
                onClick={() => {
                  setScrim(false)
                  setEnabledProducts(selectedProducts)
                }}>
                Ok
              </Button>
            </Actions>
          </Dialog>
        </Scrim>
      )}
    </>
  )
}

export default EditProducts
