import React, { useEffect, useState } from 'react'
// @ts-ignore
import { Button, Table, TextField } from '@equinor/eds-core-react'
import { Product } from '../../gen-api/src/models'
import { ProductsInCombination } from '../CombinationsWrapper'

const { Body, Row, Cell, Head } = Table

interface CombinationTableProps {
  products: any
  sacks: any
  enabledProducts: any
  updateCombination: any
  productsInCombination: ProductsInCombination
}

export const CombinationTable = ({
  products,
  sacks,
  enabledProducts,
  updateCombination,
  productsInCombination,
}: CombinationTableProps) => {
  const [values, setValues] = useState<ProductsInCombination>({})
  const [invalidValue, setInvalidValue] = useState<boolean>(true)
  const productList: Array<Product> = Object.values(products)

  // When enabledProducts changes. Removed the ones not enabled from the values.
  useEffect(() => {
    let newValues = {}
    Object.values(values).forEach(value => {
      // @ts-ignore
      if (enabledProducts.includes(value.id)) newValues = { ...newValues, [value.id]: value }
    })

    setValues(setPercentages(newValues))
  }, [enabledProducts])

  useEffect(() => {
    setValues(setPercentages(productsInCombination))
  }, [productsInCombination])

  const stripZeroAndUpdate = () => {
    let noneEmptyValues: ProductsInCombination = {}
    Object.values(values).forEach(value => {
      if (value.value > 0) noneEmptyValues[value.id] = value
    })
    updateCombination(noneEmptyValues)
  }

  function setPercentages(newValues: ProductsInCombination): ProductsInCombination {
    // Add up all the mass in the combination
    let massSum = 0
    Object.entries(newValues).forEach(([id, productValue]) => {
      massSum += productValue.value * products[id].sackSize
    })
    // Set the percentages to the value object for combination
    Object.entries(newValues).forEach(([id, productValues]) => {
      productValues.percentage = 100 * ((productValues.value * products[id].sackSize) / massSum)
    })

    return newValues
  }

  const handleValueChange = (productId: string, value: string) => {
    let newValues: any = { ...values, [productId]: { value: parseInt(value), id: productId } }
    let tempInvalid: boolean = false

    // Check for any negative numbers
    // @ts-ignore
    if (Math.sign(value) < 0) {
      tempInvalid = true
    }
    const newValuesWithPercentage = setPercentages(newValues)
    setInvalidValue(tempInvalid)
    setValues(newValuesWithPercentage)
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
                        value={values[product.id]?.value || ''}
                        type="number"
                        placeholder={sacks ? 'Sacks (' + product.sackSize + 'kg)' : 'Number of units'}
                        onChange={(event: any) => handleValueChange(product.id, event.target.value)}
                        style={{ background: 'transparent' }}
                      />
                    </Cell>
                    <Cell>{values[product.id]?.percentage ? values[product.id]?.percentage.toFixed(1) : 0}</Cell>
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
