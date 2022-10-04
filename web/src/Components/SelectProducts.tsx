import React, { ReactElement } from 'react'
// @ts-ignore
import { Checkbox, Chip, Switch, Typography } from '@equinor/eds-core-react'
// @ts-ignore
import styled from 'styled-components'
import { Products, Product } from '../Types'
import useLocalStorage from '../Hooks'
import { sortProducts } from '../Utils'

const ChipBox = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  width: 50%;
`

const ProductBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-right: 1px solid;
  padding: 0 10px 0 0;
`

interface SelectProductsProps {
  allProducts: Products
  enabledProducts: Products
  setEnabledProducts: Function
}

type ChipBoxStates = 'default' | 'active'

export const SelectProducts = ({
  allProducts,
  enabledProducts,
  setEnabledProducts,
}: SelectProductsProps): ReactElement => {
  const productList: Array<Product> = sortProducts(Object.values(allProducts))
  // Create set to only keep unique suppliers, then back to array to map them.
  // @ts-ignore
  const suppliers: Array<string> = [...new Set(productList.map((p: any) => p.supplier))]
  // @ts-ignore
  const [selectedSuppliers, setSelectedSuppliers] = useLocalStorage<T>('selectedSuppliers', suppliers)

  function handleChipToggle(supplier: string) {
    if (selectedSuppliers.includes(supplier)) {
      let newEnabledProducts: Products = {}
      Object.values(enabledProducts).forEach(product => {
        if (product.supplier !== supplier) {
          newEnabledProducts = { ...newEnabledProducts, product }
        }
      })
      setEnabledProducts(newEnabledProducts)
      setSelectedSuppliers(selectedSuppliers.filter((sup: string) => sup !== supplier))
    } else {
      setSelectedSuppliers([supplier, ...selectedSuppliers])
    }
  }

  function handleProductToggle(event: any, id: string) {
    if (event.target.checked) {
      setEnabledProducts({ ...enabledProducts, [id]: allProducts[id] })
    } else {
      delete enabledProducts[id]
      setEnabledProducts({ ...enabledProducts })
    }
  }

  function handleAllToggle(event: any) {
    if (event.target.checked) {
      let newEnabledProducts: Products = {}
      productList.forEach(product => {
        if (selectedSuppliers.includes(product.supplier) && product.cumulative !== null) {
          newEnabledProducts = { ...newEnabledProducts, [product.id]: product }
        }
      })
      setEnabledProducts(newEnabledProducts)
    } else {
      setEnabledProducts({})
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
        <ChipBox>
          {suppliers.map((supplier: string) => {
            let active: ChipBoxStates = 'default'
            if (selectedSuppliers.includes(supplier)) active = 'active'
            return (
              <Chip
                key={supplier}
                variant={active}
                onClick={() => {
                  handleChipToggle(supplier)
                }}
              >
                {supplier}
              </Chip>
            )
          })}
        </ChipBox>
        <Switch label='Select all' onClick={(e: any) => handleAllToggle(e)} />
      </div>
      {/* If some of the displayed products have missing PSD data, show a small notice*/}
      {productList.find((p: Product) => p.cumulative === null && selectedSuppliers.includes(p.supplier)) && (
        <div style={{ textAlign: 'end', width: '100%' }}>
          <small style={{ color: 'red' }}> *Missing bridge data</small>
        </div>
      )}
      <div
        style={{
          paddingRight: '15px',
          display: 'flex',
          flexFlow: 'column wrap',
          maxHeight: '600px',
          width: '800px',
          overflow: 'auto',
        }}
      >
        {!selectedSuppliers.length && <p>Select a supplier to show products</p>}
        {productList.map((product, key) => {
          if (!selectedSuppliers.includes(product.supplier)) return null
          const isChecked = Object.keys(enabledProducts).includes(product.id)
          const disabled = product.cumulative == null
          return (
            <ProductBox key={key}>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }}>
                <Checkbox
                  checked={isChecked}
                  // @ts-ignore
                  onChange={(event: Event) => handleProductToggle(event, product.id)}
                  label={product.title}
                  disabled={disabled}
                  name='multiple'
                  value='first'
                />
                {disabled && <div style={{ color: 'red', fontSize: '24px', alignSelf: 'center' }}>*</div>}
              </div>
              <Typography variant='body_short'>{product.supplier}</Typography>
            </ProductBox>
          )
        })}
      </div>
    </>
  )
}

export default SelectProducts
