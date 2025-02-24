// @ts-ignore
import { TextField } from '@equinor/eds-core-react'
import { useEffect, useState } from 'react'
import type { Products, ProductsInCombination } from '../../Types'
import { CombinationTableHeader, CombinationTableValues } from './CardContainer'

function setPercentages(newValues: ProductsInCombination, allProducts: Products): ProductsInCombination {
  // Add up all the mass in the combination
  let massSum = 0
  Object.entries(newValues).forEach(([id, productValue]) => {
    massSum += productValue.value * allProducts[id].sackSize
  })
  // Set the percentages to the value object for combination
  Object.entries(newValues).forEach(([id, productValues]) => {
    if (productValues.value === 0) {
      productValues.percentage = 0
    } else {
      productValues.percentage = 100 * ((productValues.value * allProducts[id].sackSize) / massSum)
    }
  })
  return newValues
}

interface CombinationTableProps {
  allProducts: Products
  sacks: boolean
  updateCombination: Function
  productsInCombination: ProductsInCombination
  combinationName: string
}

export const CombinationTable = ({
  allProducts,
  sacks,
  updateCombination,
  productsInCombination,
  combinationName,
}: CombinationTableProps) => {
  const [values, setValues] = useState<ProductsInCombination>({})
  const alternatingColor = ['white', '#F5F5F5']

  useEffect(() => {
    setValues(setPercentages(productsInCombination, allProducts))
  }, [productsInCombination, setPercentages, allProducts])

  const handleValueChange = (productId: string, value: string) => {
    if (!value) {
      value = '0'
    }
    let formattedValue
    if (sacks) {
      formattedValue = Number.parseInt(value)
    } else {
      formattedValue = Number.parseFloat(value)
    }

    if (formattedValue < 0) return
    const newValues: any = {
      ...values,
      [productId]: { value: formattedValue, id: productId },
    }
    const newValuesWithPercentage = setPercentages(newValues, allProducts)
    setValues({ ...newValuesWithPercentage })
    updateCombination({
      name: combinationName,
      sacks: sacks,
      values: newValuesWithPercentage,
      cumulative: null,
    })
  }
  return (
    <div style={{ display: 'flex', flexFlow: 'column', minWidth: 'fit-content' }}>
      <CombinationTableHeader>
        <div>Product</div>
        {sacks ? (
          <div>Sacks</div>
        ) : (
          <div>
            kg/m<sup>3</sup>
          </div>
        )}
        <div>%</div>
      </CombinationTableHeader>
      {Object.keys(productsInCombination).map((id, index) => (
        <CombinationTableValues key={index} style={{ backgroundColor: `${alternatingColor[index % 2]}` }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ minWidth: 'fit-content', alignSelf: 'center' }}>{allProducts[id].title}</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '5px',
              }}
            >
              <div style={{ maxWidth: '100px' }}>
                <TextField
                  id={id}
                  // @ts-ignore
                  value={values[id]?.value || 0}
                  type="number"
                  onChange={(event: any) => handleValueChange(id, event.target.value)}
                  style={{
                    // @ts-ignore
                    '--eds-input-background': 'rgba(133,186,191,0.15)',
                  }}
                />
              </div>
              <div style={{ width: '42px' }}>{values[id]?.percentage ? values[id]?.percentage.toFixed(1) : 0}</div>
            </div>
          </div>
        </CombinationTableValues>
      ))}
    </div>
  )
}

export default CombinationTable
