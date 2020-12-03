import React, { ReactElement } from 'react'
// @ts-ignore
import { Checkbox, LinearProgress, Chip, Switch, Typography } from '@equinor/eds-core-react'
// @ts-ignore
import styled from 'styled-components'
import { Products, Product } from '../Types'
import useLocalStorage from '../Hooks'
import { sortProducts } from '../Utils'

const ChipBox = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
`

interface SelectProductsProps {
  loading: boolean
  products: Products
  enabledProducts: Array<string>
  setEnabledProducts: Function
}

const Link = styled.a`
  color: #007079;
  font-size: 16px;
  line-height: 20px;
  text-decoration-line: underline;
`

export const SelectProducts = ({
  loading,
  products,
  enabledProducts,
  setEnabledProducts,
}: SelectProductsProps): ReactElement => {
  const productList: Array<Product> = sortProducts(Object.values(products))
  // Create set to only keep unique suppliers, then back to array to map them.
  // @ts-ignore
  const suppliers: Array<string> = [...new Set(productList.map((p: any) => p.supplier))]
  // @ts-ignore
  const [selectedSuppliers, setSelectedSuppliers] = useLocalStorage<T>('selectedSuppliers', suppliers)

  function handleChipToggle(supplier: string) {
    // This is a bit messy. Mainly because we have two product objects, one array and one Map. Should be just one Object
    if (selectedSuppliers.includes(supplier)) {
      let productsWithDisabledSupplier = productList
        .filter((p: any) => p.supplier === supplier)
        .map((p: any) => {
          return p.id
        })
      let shouldBeRemoved = enabledProducts.filter((p: any) => productsWithDisabledSupplier.includes(p))
      setSelectedSuppliers(selectedSuppliers.filter((s: string) => s !== supplier))
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

  function handleAllToggle(event: any) {
    if (event.target.checked) {
      let notMissing = productList.filter(p => p.cumulative !== null)
      let fromSelectedSuppliers = notMissing.filter(p => selectedSuppliers.includes(p.supplier))
      let justIds = fromSelectedSuppliers.map(p => p.id)
      setEnabledProducts(justIds)
    } else {
      setEnabledProducts([])
    }
  }

  if (loading) return <LinearProgress />

  return (
    <>
      <div style={{ paddingBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={'https://statoilsrm.sharepoint.com/sites/LCMlibrary/Lists/Product'}>Products summary</Link>
        <Switch label='Select all' onClick={(e: any) => handleAllToggle(e)} />
      </div>
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

      {/* If some of the displayed products have missing PSD data, show a small notice*/}
      {productList.find((p: Product) => p.cumulative === null && selectedSuppliers.includes(p.supplier)) && (
        <div style={{ textAlign: 'end', padding: '10px 0' }}>
          <small style={{ color: 'red', paddingLeft: '10px' }}> *Missing bridge data</small>
        </div>
      )}

      <div style={{ paddingRight: '15px' }}>
        {!selectedSuppliers.length && <p>Select a supplier to show products</p>}
        {productList.map((product, key) => {
          if (!selectedSuppliers.includes(product.supplier)) return null
          const isChecked = enabledProducts.includes(product.id)
          const disabled = product.cumulative == null
          return (
            <div
              key={key}
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={isChecked}
                  onChange={() => handleProductToggle(product.id)}
                  label={product.title}
                  disabled={disabled}
                  name='multiple'
                  value='first'
                />
                {disabled && <div style={{ color: 'red', fontSize: '24px', alignSelf: 'center' }}>*</div>}
              </div>
              <Typography variant='body_short'>{product.supplier}</Typography>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default SelectProducts
