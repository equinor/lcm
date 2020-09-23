// @ts-ignore
import React from 'react'
// @ts-ignore
import {Table, TextField} from '@equinor/eds-core-react'
import {Product} from "../../gen-api/src/models";

const {Body, Row, Cell, Head} = Table

interface CombinationTableProps {
    products: any
    sacks: any
    enabledProducts: any
    combination: any
    updateCombination: any
}

export const CombinationTable = ({combination, products, sacks, enabledProducts, updateCombination}: CombinationTableProps) => {
    const handleValue = (event: any, productId: string) => {
        updateCombination(productId, event.target.value)
    }

    const productList: Array<Product> = Object.values(products);

    return (
        <div className="container">
            <div className="group">
                <Table>
                    <Head>
                        <Row style={{height: '60px'}}>
                            <Cell as="th" scope="col">
                                {sacks ? (
                                    <p>Sacks</p>
                                ) : (
                                    <p>Blend (ppg or kg/m3)</p>
                                )
                                }
                            </Cell>
                            <Cell as="th" scope="col">
                                %
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {productList.map((product, index) =>
                            enabledProducts.includes(product["id"]) ? (
                                <Row key={`${product.id}-${product.supplier}`}>
                                    <Cell>
                                        <TextField
                                            id={product.id}
                                            value={(combination.values.has(product.id)) ? combination.values.get(product.id).value : ""}
                                            type="number"
                                            placeholder={sacks ? "Sacks (" + product.sackSize + "kg)" : "Number of units"}
                                            onChange={(event: any) => {
                                                handleValue(event, product.id);
                                            }}
                                            style={{background: 'transparent'}}
                                        />
                                    </Cell>
                                    <Cell>{((combination.values.has(product.id) ? combination.values.get(product.id).percentage : 0)).toFixed(1)}
                                    </Cell>
                                </Row>
                            ) : null
                        )}
                    </Body>
                </Table>
            </div>
        </div>
    )
}

export default CombinationTable;