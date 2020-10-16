import React, { ReactElement, useEffect, useState } from 'react'
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
  setEnabledProducts: Function
}

export const SelectProducts = ({
  loading,
  products,
  enabledProducts,
  setEnabledProducts,
}: SelectProductsProps): ReactElement => {
  const productList: Array<Product> = Object.values(products)
  // Create set to only keep unique suppliers, then back to array to map them.
  // @ts-ignore
  const suppliers: Array<string> = [...new Set(productList.map((p: any) => p.supplier))]
  const storedSelectedSuppliers = JSON.parse(localStorage.getItem('selectedSuppliers') || '[]')
  const [selectedSuppliers, setSelectedSuppliers] = useState<Array<string>>(storedSelectedSuppliers || [])

  // Saved selectedSuppliers in localStorage
  useEffect(() => {
    localStorage.setItem('selectedSuppliers', JSON.stringify(selectedSuppliers))
  }, [selectedSuppliers])

  function handleChipToggle(supplier: string) {
    // This is a bit messy. Mainly because we have two product objects, one array and one Map. Should be just one Object
    if (selectedSuppliers.includes(supplier)) {
      let productsWithDisabledSupplier = productList
        .filter((p: any) => p.supplier === supplier)
        .map((p: any) => {
          return p.id
        })
      let shouldBeRemoved = enabledProducts.filter((p: any) => productsWithDisabledSupplier.includes(p))
      setSelectedSuppliers(selectedSuppliers.filter(s => s !== supplier))
      let temp = enabledProducts.filter((p: any) => !shouldBeRemoved.includes(p))
      setEnabledProducts(temp)
    } else {
      setSelectedSuppliers([supplier, ...selectedSuppliers])
    }
  }

  function handleProductToggle(id: string) {
    if (enabledProducts.includes(id)) {
      setEnabledProducts(enabledProducts.filter((exisitingId: string) => exisitingId !== id))
    } else {
      setEnabledProducts([id, ...enabledProducts])
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
                handleChipToggle(supplier)
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
          const isChecked = enabledProducts.includes(product.id)
          return (
            <li key={key}>
              <Checkbox
                checked={isChecked}
                onChange={() => handleProductToggle(product.id)}
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
