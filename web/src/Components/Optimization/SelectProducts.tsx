import React, { ReactElement, useState } from 'react'
// @ts-ignore
import { Checkbox, LinearProgress, Chip } from '@equinor/eds-core-react'
// @ts-ignore
import styled from 'styled-components'
import { Product } from '../../gen-api/src/models'

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
`

const ChipBox = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
`

interface SelectProductsProps {
  loading: boolean
  products: any // TODO: fix better type
  enabledProducts: Array<string>
  updateProduct: Function
}

export const SelectProducts = ({
  loading,
  products,
  enabledProducts,
  updateProduct,
}: SelectProductsProps): ReactElement => {
  const productList: Array<Product> = Object.values(products)
  // Create set to only keep unique suppliers, then back to array to map them.
  // @ts-ignore
  const suppliers: Array<string> = [...new Set(productList.map((p: any) => p.supplier))]
  const [selectedSuppliers, setSelectedSuppliers] = useState<Array<string>>([])

  function handleChipClick(supplier: string) {
    if (selectedSuppliers.includes(supplier)) {
      setSelectedSuppliers(selectedSuppliers.filter(s => s !== supplier))
      // productList.filter((p: any) => p.supplier === supplier).forEach((p: any) => updateProduct(p.id, true))
    } else {
      setSelectedSuppliers([supplier, ...selectedSuppliers])
    }
  }
  if (loading) return <LinearProgress />
  return (
    <>
      <ChipBox>
        {suppliers.map((supplier: string) => {
          let active = 'default'
          if (selectedSuppliers.includes(supplier)) active = 'active'
          return (
            <Chip
              key={supplier}
              variant={active}
              onClick={() => {
                handleChipClick(supplier)
              }}>
              {supplier}
            </Chip>
          )
        })}
      </ChipBox>

      <List>
        {!selectedSuppliers.length && <p>Select a supplier to show products</p>}
        {productList.map((product, key) => {
          // @ts-ignore
          if (!selectedSuppliers.includes(product.supplier)) return null
          // @ts-ignore
          const label = product.name + ', ' + product.supplier
          console.log(enabledProducts)
          const isChecked = enabledProducts.includes(product.id)
          return (
            <li key={key}>
              <Checkbox
                checked={isChecked}
                onChange={() => updateProduct(product.id, isChecked)}
                label={label}
                name="multiple"
                value="first"
              />
            </li>
          )
        })}
      </List>
    </>
  )
}

export default SelectProducts
