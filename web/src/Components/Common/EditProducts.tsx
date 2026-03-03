import { Button, Dialog } from '@equinor/eds-core-react'
import { type ReactElement, useEffect, useState } from 'react'
import type { Products } from '../../lib/types'
import { SelectProducts } from './SelectProducts'

type AddProductsProps = {
  allProducts: Products
  enabledProducts: Products
  setEnabledProducts: (products: Products) => void
}

export function EditProducts({ allProducts, enabledProducts, setEnabledProducts }: AddProductsProps): ReactElement {
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
      <Dialog
        style={{ width: 'min-content', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        open={dialogOpen}
      >
        <Dialog.Header>
          <Dialog.Title>Select products in blend</Dialog.Title>
        </Dialog.Header>
        <Dialog.CustomContent
          style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
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
