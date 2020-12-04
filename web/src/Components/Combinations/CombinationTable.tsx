import React, { useEffect, useState } from 'react'
// @ts-ignore
import { TextField } from '@equinor/eds-core-react'
import { CombinationTableHeader, CombinationTableValues } from './CardContainer'
import { Products, ProductsInCombination } from '../../Types'

interface CombinationTableProps {
  products: Products
  sacks: boolean
  enabledProducts: any
  updateCombination: Function
  productsInCombination: ProductsInCombination
  combinationName: string
}

export const CombinationTable = ({
  products,
  sacks,
  enabledProducts,
  updateCombination,
  productsInCombination,
  combinationName,
}: CombinationTableProps) => {
  const [values, setValues] = useState<ProductsInCombination>({})
  const alternatingColor = ['white', '#F5F5F5']
  const productsToList = Object.values(products).filter(p => enabledProducts.includes(p['id']))

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
    if (!(Object.keys(products).length > 0)) return
    setValues(setPercentages(productsInCombination))
  }, [productsInCombination, products])

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
    if (parseInt(value) < 0) return
    let newValues: any = { ...values, [productId]: { value: parseInt(value), id: productId } }
    const newValuesWithPercentage = setPercentages(newValues)
    setValues({ ...newValuesWithPercentage })
    updateCombination({ name: combinationName, sacks: sacks, values: newValuesWithPercentage, cumulative: null })
  }

  return (
    <div style={{ display: 'flex', flexFlow: 'column' }}>
      <CombinationTableHeader>
        {sacks ? (
          <div>Sacks</div>
        ) : (
          <div>
            Blend (ppb or kg/m<sup>3</sup>)
          </div>
        )}
        <div>%</div>
      </CombinationTableHeader>
      {productsToList.map((product, index) => (
        <CombinationTableValues key={index} style={{ backgroundColor: `${alternatingColor[index % 2]}` }}>
          <div style={{ width: '150px' }}>
            <TextField
              id={product.id}
              value={values[product.id]?.value || ''}
              type='number'
              placeholder={sacks ? 'Sacks (' + product.sackSize + 'kg)' : 'Number of units'}
              onChange={(event: any) => handleValueChange(product.id, event.target.value)}
              style={{ background: 'transparent', maxWidth: '200px', height: '37px', border: 'none' }}
            />
          </div>
          <div style={{ paddingLeft: '16px' }}>
            {values[product.id]?.percentage ? values[product.id]?.percentage.toFixed(1) : 0}
          </div>
        </CombinationTableValues>
      ))}
    </div>
  )
}

export default CombinationTable
