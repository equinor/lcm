// @ts-ignore
import React, { useEffect, useState } from 'react'
// @ts-ignore
import { Button, Table, TextField } from '@equinor/eds-core-react'
import { Product } from '../../gen-api/src/models'

const { Body, Row, Cell, Head } = Table

interface CombinationTableProps {
  products: any
  sacks: any
  enabledProducts: any
  combination: any
  updateCombination: any
}

export const CombinationTable = ({
  combination,
  products,
  sacks,
  enabledProducts,
  updateCombination,
}: CombinationTableProps) => {
  const [values, setValues] = useState<any>({})
  const [invalidValue, setInvalidValue] = useState<boolean>(false)
  const productList: Array<Product> = Object.values(products)

  useEffect(() => {
    let newValues: any = {}
    // Deconstruct combination Map
    combination.values.forEach((i: any) => {
      newValues[i.id] = i.value
    })
    setValues(newValues)
  }, [combination])

  const handleValueChange = (productId: string, value: number) => {
    let tempInvalid: boolean = false
    // @ts-ignore
    Object.values(values).forEach((val: any) => {
      if (Math.sign(parseInt(val)) !== 1) {
        tempInvalid = true
      }
    })
    setValues({ ...values, [productId]: value })
    setInvalidValue(tempInvalid)
  }

  return (
    <div className="container">
      <div className="group" style={{ display: 'flex', flexFlow: 'column' }}>
        <Table>
          <Head>
            <Row style={{ height: '60px' }}>
              <Cell as="th" scope="col">
                {sacks ? <p>Sacks</p> : <p>Blend (ppg or kg/m3)</p>}
              </Cell>
              <Cell as="th" scope="col">
                %
              </Cell>
            </Row>
          </Head>
          <Body>
            {productList.map(
              (product) =>
                enabledProducts.includes(product['id']) && (
                  <Row key={product.id}>
                    <Cell>
                      <TextField
                        id={product.id}
                        value={values[product.id]}
                        type="number"
                        placeholder={
                          sacks
                            ? 'Sacks (' + product.sackSize + 'kg)'
                            : 'Number of units'
                        }
                        onChange={(event: any) =>
                          handleValueChange(product.id, event.target.value)
                        }
                        style={{ background: 'transparent' }}
                      />
                    </Cell>
                    <Cell>
                      {(combination.values.has(product.id)
                        ? combination.values.get(product.id).percentage
                        : 0
                      ).toFixed(1)}
                    </Cell>
                  </Row>
                )
            )}
          </Body>
        </Table>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => updateCombination(values)}
          style={{ marginTop: '10px' }}
          disabled={invalidValue}
        >
          Apply
        </Button>
      </div>
    </div>
  )
}

export default CombinationTable
