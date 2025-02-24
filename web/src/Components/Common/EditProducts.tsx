// @ts-ignore
import { Button, Dialog } from '@equinor/eds-core-react'
import { type ReactElement, useEffect, useState } from 'react'
import type { Products } from '../../Types'
import SelectProducts from './SelectProducts'

interface AddProductsProps {
  allProducts: Products
  enabledProducts: Products
  setEnabledProducts: Function
}

export const EditProducts = ({ allProducts, enabledProducts, setEnabledProducts }: AddProductsProps): ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [selectedProducts, setSelectedProducts] = useState<Products>(enabledProducts)

  useEffect(() => {
    setSelectedProducts(enabledProducts)
  }, [enabledProducts])

  return (
    <>
      <Button variant="outlined" onClick={() => setDialogOpen(true)}>
        Select products
      </Button>
      <Dialog style={{ width: 'min-content' }} open={dialogOpen}>
        <Dialog.Header>
          <Dialog.Title>Select products in blend</Dialog.Title>
        </Dialog.Header>
        <Dialog.CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
          <SelectProducts
            allProducts={allProducts}
            enabledProducts={selectedProducts}
            setEnabledProducts={setSelectedProducts}
          />
        </Dialog.CustomContent>
        <Dialog.Actions
          style={{
            width: 'fill-available',
            display: 'flex',
            justifySelf: 'center',
          }}
        >
          <Button
            style={{ width: '200px' }}
            onClick={() => {
              setDialogOpen(false)
              setEnabledProducts(selectedProducts)
            }}
          >
            Ok
          </Button>
        </Dialog.Actions>
      </Dialog>
    </>
  )
}

export default EditProducts
