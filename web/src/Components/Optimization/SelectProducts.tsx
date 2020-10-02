import React, { ReactElement } from 'react'
// @ts-ignore
import { Checkbox, LinearProgress } from '@equinor/eds-core-react'
// @ts-ignore
import styled from 'styled-components'
import { Product } from '../../gen-api/src/models'

const UnstyledList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
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
  if (loading) return <LinearProgress />

  const productList: Array<Product> = Object.values(products)

  return (
    <div>
      <UnstyledList>
        {productList.map((product, key) => {
          const label = product['id'] + ', ' + product['supplier']
          const isChecked = enabledProducts.includes(product['id'])
          return (
            <li key={key}>
              <Checkbox
                checked={isChecked}
                onChange={() => updateProduct(product['id'], isChecked)}
                label={label}
                name="multiple"
                value="first"
              />
            </li>
          )
        })}
      </UnstyledList>
    </div>
  )
}

export default SelectProducts
