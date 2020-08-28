import React from 'react'
import { Table } from '@equinor/eds-core-react'

const { Body, Row, Cell, Head } = Table

export const ProductTable = ({ fetched, productMap }) => (
  <div className="container">
    <div className="">
      <div className="group">
        <Table>
          <Head>
            <Row style={{ height: '60px' }}>
              <Cell as="th" scope="col">
                Product
                </Cell>
              <Cell as="th" scope="col">
                Supplier
              </Cell>
            </Row>
          </Head>
          <Body>
            {(fetched && productMap.length !== 0) ? Array.from(productMap.values()).map((product, index) =>
              product.enabled ? (
                <Row>
                  <Cell>{product.name}</Cell>
                  <Cell>{product.supplier}</Cell>
                </Row>
              ) : ""
            ) : ""
            }
          </Body>
        </Table>
      </div>
    </div>
  </div>
)

export default ProductTable