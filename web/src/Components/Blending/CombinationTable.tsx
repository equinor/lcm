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
  const [invalidValue, setInvalidValue] = useState<boolean>(true)
  const productList: Array<Product> = Object.values(products)

  useEffect(() => {
    let newValues: any = {}
    // Filter out disabled products
    enabledProducts.forEach((p: string) => {
      newValues[p] = values[p]
    })
    setValues(newValues)
  }, [enabledProducts])

  const stripZeroAndUpdate = () => {
    let noneEmptyValues: any = {}
    for (const [key, value] of Object.entries(values)) {
      // @ts-ignore
      if (value > 0) {
        noneEmptyValues[key] = value
      }
    }
    updateCombination(noneEmptyValues)
  }

  const handleValueChange = (productId: string, value: string) => {
    let newValues: any = { ...values, [productId]: parseInt(value) }
    let tempInvalid: boolean = false
    // Check for any negative numbers
    // @ts-ignore
    Object.values(newValues).forEach((val: number) => {
      if (Math.sign(val) < 0) {
        tempInvalid = true
      }
    })
    setInvalidValue(tempInvalid)
    setValues(newValues)
  }

  return (
    <div className="container">
      <div className="group" style={{ display: 'flex', flexFlow: 'column' }}>
        <Table>
          <Head>
            <Row>
              <Cell as="th" scope="col">
                {sacks ? (
                  'Sacks'
                ) : (
                  <>
                    Blend (ppg or kg/m<sup>3</sup>)
                  </>
                )}
              </Cell>
              <Cell as="th" scope="col">
                %
              </Cell>
            </Row>
          </Head>
          <Body>
            {productList.map(
              product =>
                enabledProducts.includes(product['id']) && (
                  <Row key={product.id}>
                    <Cell>
                      <TextField
                        id={product.id}
                        value={values[product.id] || ''}
                        type="number"
                        placeholder={sacks ? 'Sacks (' + product.sackSize + 'kg)' : 'Number of units'}
                        onChange={(event: any) => handleValueChange(product.id, event.target.value)}
                        style={{ background: 'transparent' }}
                      />
                    </Cell>
                    <Cell>
                      {(combination.values.has(product.id) ? combination.values.get(product.id).percentage : 0).toFixed(
                        1
                      )}
                    </Cell>
                  </Row>
                )
            )}
          </Body>
        </Table>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => stripZeroAndUpdate()}
          style={{ marginTop: '10px' }}
          disabled={invalidValue}>
          Apply
        </Button>
      </div>
    </div>
  )
}

export default CombinationTable
