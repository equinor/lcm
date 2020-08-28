import React from 'react'
import { Typography, Card } from '@equinor/eds-core-react'
import ProductTable from './ProductTable.js'

const { CardHeader, CardHeaderTitle } = Card

export const ProductCard = ({ fetched, productMap, products }) => {
  return (
    <Card style={{ width: 'fit-content', display: 'inline-block', margin: "10px", padding: "20px" }}>
      <CardHeader style={{ height: '50px' }}>
        <CardHeaderTitle>
          <Typography variant="h5" style={{ color: 'white' }}>Magnus was here</Typography>
        </CardHeaderTitle>
      </CardHeader>
      <ProductTable fetched={fetched} productMap={productMap} products={products} />
    </Card>
  )
}

export default ProductCard