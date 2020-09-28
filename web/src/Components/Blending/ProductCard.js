import React from 'react'
import { Card } from '@equinor/eds-core-react'
import ProductTable from './ProductTable.tsx'

export const ProductCard = ({ enabledProducts, products }) => {
  return (
    <Card
      style={{
        width: 'fit-content',
        display: 'inline-block',
        margin: '10px',
        padding: '20px',
        height: 'auto',
        paddingTop: '50px',
      }}
    >
      <ProductTable enabledProducts={enabledProducts} products={products} />
    </Card>
  )
}

export default ProductCard
