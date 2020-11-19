import React, { ReactElement } from 'react'
import { Products } from '../../Types'
import { CombinationTableHeader, CombinationTableValues } from './CardContainer'

interface ProductTableProps {
  products: Products
  enabledProducts: Array<string>
}

export const ProductTable = ({ enabledProducts, products }: ProductTableProps): ReactElement => {
  const alternatingColor = ['white', '#F5F5F5']
  const productsToList = Object.values(products).filter(p => enabledProducts.includes(p['id']))

  return (
    <div style={{ display: 'flex', flexFlow: 'column' }}>
      <div style={{ height: '48px' }} />
      <CombinationTableHeader>
        <div>Product</div>
        <div>Supplier</div>
      </CombinationTableHeader>
      {productsToList.map((product, index) => (
        <CombinationTableValues
          style={{
            height: '36px',
            borderBottom: '#375981 1px solid',
            backgroundColor: `${alternatingColor[index % 2]}`,
          }}>
          <div style={{ paddingRight: '25px' }}>{product.title}</div>
          <div>{product.supplier}</div>
        </CombinationTableValues>
      ))}
    </div>
  )
}

export default ProductTable
