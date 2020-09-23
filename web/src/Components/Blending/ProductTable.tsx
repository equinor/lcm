import React, {ReactElement} from 'react'
// @ts-ignore
import {Table} from '@equinor/eds-core-react'
import {Product} from "../../gen-api/src/models";

const {Body, Row, Cell, Head} = Table

interface ProductTableProps {
    products: any // TODO: fix better type
    enabledProducts: any // TODO: fix better type
}

export const ProductTable = ({enabledProducts, products}: ProductTableProps): ReactElement => {
    const productList: Array<Product> = Object.values(products);

    return (
        <div className="container">
            <div className="">
                <div className="group">
                    <Table>
                        <Head>
                            <Row style={{height: '60px'}}>
                                <Cell as="th" scope="col">
                                    Product
                                </Cell>
                                <Cell as="th" scope="col">
                                    Supplier
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {productList.map((product, index) =>
                                enabledProducts.includes(product["id"]) ? (
                                    <Row key={`${product.id}-${product.supplier}`}>
                                        <Cell>{product.id}</Cell>
                                        <Cell>{product.supplier}</Cell>
                                    </Row>
                                ) : null
                            )}
                        </Body>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default ProductTable