import { Checkbox, Chip, Switch, Typography } from '@equinor/eds-core-react'
import type { ReactElement } from 'react'

import styled from 'styled-components'
import useLocalStorage from '../../Hooks'
import type { Product, Products } from '../../Types'
import { sortProducts } from '../../Utils'

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
  setEnabledProducts: (p: Products) => void
}

type ChipBoxStates = 'default' | 'active'

export const SelectProducts = ({
  allProducts,
  enabledProducts,
  setEnabledProducts,
}: SelectProductsProps): ReactElement => {
  const productList: Array<Product> = sortProducts(Object.values(allProducts))
  // Create set to only keep unique suppliers, then back to array to map them.

  const suppliers: Array<string> = [...new Set(productList.map((p: Product) => p.supplier))]

  const [selectedSuppliers, setSelectedSuppliers] = useLocalStorage<Array<string>>('selectedSuppliers', suppliers)

  function handleChipToggle(supplier: string) {
    if (selectedSuppliers.includes(supplier)) {
      let newEnabledProducts: Products = {}
      Object.values(enabledProducts).forEach((product) => {
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

  function handleProductToggle(event: React.ChangeEvent<HTMLInputElement>, id: string) {
    if ((event.target as HTMLInputElement).checked) {
      setEnabledProducts({ ...enabledProducts, [id]: allProducts[id] })
    } else {
      delete enabledProducts[id]
      setEnabledProducts({ ...enabledProducts })
    }
  }

  function handleAllToggle(event: React.MouseEvent<HTMLInputElement>) {
    if ((event.target as HTMLInputElement).checked) {
      let newEnabledProducts: Products = {}
      productList.forEach((product) => {
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
        }}
      >
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
        <Switch label="Select all" onClick={(e: React.MouseEvent<HTMLInputElement>) => handleAllToggle(e)} />
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
        {productList.map((product) => {
          if (!selectedSuppliers.includes(product.supplier)) return null
          const isChecked = Object.keys(enabledProducts).includes(product.id)
          const disabled = product.cumulative == null
          return (
            <ProductBox key={product.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '5px',
                }}
              >
                <Checkbox
                  checked={isChecked}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleProductToggle(event, product.id)}
                  label={product.title}
                  disabled={disabled}
                  name="multiple"
                  value="first"
                />
                {disabled && (
                  <div
                    style={{
                      color: 'red',
                      fontSize: '24px',
                      alignSelf: 'center',
                    }}
                  >
                    *
                  </div>
                )}
              </div>
              <Typography variant="body_short">{product.supplier}</Typography>
            </ProductBox>
          )
        })}
      </div>
    </>
  )
}

export default SelectProducts
