import React, { useContext, useEffect, useState } from 'react'
// @ts-ignore
import { Button, Icon, Switch, Input, Tooltip, Divider } from '@equinor/eds-core-react'
import CombinationTable from './CombinationTable'
import styled from 'styled-components'
import { Card } from './CardContainer'
import { Bridge, Combination, GraphData, Product, Products } from '../../Types'
import EditProducts from '../Common/EditProducts'
import { CombinationAPI } from '../../Api'
import { ErrorToast } from '../Common/Toast'
import { findDValue, findGraphData } from '../../Utils'
import { IAuthContext, AuthContext } from 'react-oauth2-code-pkce'
import { edit, close, delete_to_trash } from '@equinor/eds-icons'

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: self-end;
  margin-bottom: 0.5rem;
`

const CardSummation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 3px 5px 15px 10px;
  border-top: 1px solid;
`

const DValues = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 3px 5px 0 10px;
`

interface CombinationCardProps {
  sacks: boolean
  combination: Combination
  updateCombination: Function
  renameCombination: Function
  removeCombination: Function
  removeBridge: Function
  allProducts: Products
  enabledPlot: boolean
  sizeFractions: number[]
}

export const CombinationCard = ({
  sacks,
  allProducts,
  combination,
  updateCombination,
  renameCombination,
  removeCombination,
  removeBridge,
  enabledPlot,
  sizeFractions,
}: CombinationCardProps) => {
  const [combinationName, setCombinationName] = useState<string>(combination.name)
  const [totalMass, setTotalMass] = useState<number>(0)
  const [totalDensity, setTotalDensity] = useState<number>(0)
  const [enabledProducts, setEnabledProducts] = useState<Products>({})
  const { token }: IAuthContext = useContext(AuthContext)
  const [bridge, setBridge] = useState<Bridge>()
  const [D10, setD10] = useState<number>(0)
  const [D50, setD50] = useState<number>(0)
  const [D90, setD90] = useState<number>(0)
  const [isHeaderEditable, setIsHeaderEditable] = useState<boolean>(false)

  // On first render with products, set enabledProducts from saved combinations
  useEffect(() => {
    if (!(Object.keys(allProducts).length > 0)) return
    let newEnabledProducts: Products = {}
    Object.values(combination.values).forEach(prod => {
      newEnabledProducts = { ...newEnabledProducts, [prod.id]: allProducts[prod.id] }
    })
    setEnabledProducts(newEnabledProducts)
  }, [allProducts])

  // Calculate sum of mass in combination on combination change
  useEffect(() => {
    if (!(Object.keys(allProducts).length > 0)) return
    let newMass: number = 0
    let newDensity: number = 0
    Object.values(combination.values).forEach(prod => {
      newMass += allProducts[prod.id].sackSize * prod.value
      newDensity += prod.value
    })
    if (sacks) {
      setTotalMass(newMass)
    } else {
      setTotalDensity(Math.round(newDensity * 10) / 10)
    }

    CombinationAPI.postCombinationApi(token, Object.values(combination.values))
      .then(response => {
        let newBridge: Bridge = { ...bridge, [combination.name]: response.data.bridge }
        setBridge(newBridge)
        let graphData: GraphData[] = findGraphData(sizeFractions, newBridge)
        setD10(findDValue(graphData, 10, combination.name))
        setD50(findDValue(graphData, 50, combination.name))
        setD90(findDValue(graphData, 90, combination.name))
      })
      .catch(error => {
        console.error('fetch error' + error)
        ErrorToast(`${error.response.data}`, error.response.status)
      })
  }, [combination, allProducts])

  function updateEnabledProductsAndCombination(changedProducts: Products) {
    setEnabledProducts(changedProducts)

    let newCombination: Combination = { ...combination }
    newCombination.values = {}
    Object.values(changedProducts).forEach((p: Product) => {
      if (combination.values[p.id]) {
        newCombination.values[p.id] = combination.values[p.id]
      } else {
        newCombination.values[p.id] = { value: 0, percentage: 0, id: p.id }
      }
    })
    updateCombination(newCombination)
  }

  function togglePlot(e: any) {
    if (e.target.checked) {
      updateCombination(combination)
    } else {
      removeBridge(combinationName)
    }
  }

  return (
    <Card>
      <div>
        <CardHeader>
          <Tooltip title={isHeaderEditable ? 'Toggle edit off' : 'Edit combination title'}>
            <Button variant='ghost_icon' onClick={() => setIsHeaderEditable(!isHeaderEditable)}>
              <Icon data={edit} size={16} style={{ width: '40px' }} />
            </Button>
          </Tooltip>
          <Input
            id={`${combination.name}`}
            value={combinationName}
            readOnly={!isHeaderEditable}
            onChange={(event: any) => {
              setCombinationName(event.target.value)
            }}
            onBlur={() => {
              renameCombination(combinationName, combination.name)
            }}
            onKeyPress={(event: any) => {
              if (event.key === 'Enter') {
                // @ts-ignore
                document.activeElement.blur()
              }
            }}
          />
          <Tooltip title={'Delete combination'}>
            <Button variant='ghost_icon' color='danger' onClick={() => removeCombination(combination.name)}>
              <Icon data={delete_to_trash} title='close' style={{ width: '40px' }} />
            </Button>
          </Tooltip>
        </CardHeader>
        {Object.keys(enabledProducts).length ? (
          <div>
            <CombinationTable
              allProducts={allProducts}
              sacks={sacks}
              updateCombination={updateCombination}
              productsInCombination={combination.values}
              combinationName={combinationName}
            />
          </div>
        ) : (
          <div style={{ padding: '20px' }}>No products selected</div>
        )}
      </div>
      <div>
        {Object.keys(enabledProducts).length ? (
          <div style={{ borderTop: '1px solid', paddingTop: '3px' }}>
            <DValues>
              <div>D10</div>
              <div>{D10}</div>
            </DValues>
            <DValues>
              <div>D50</div>
              <div>{D50}</div>
            </DValues>
            <DValues>
              <div>D90</div>
              <div>{D90}</div>
            </DValues>
          </div>
        ) : (
          <div></div>
        )}

        {sacks ? (
          <CardSummation>
            <div>Total mass</div>
            <div>{totalMass}kg</div>
          </CardSummation>
        ) : (
          <CardSummation>
            <div>Total concentration</div>
            <div>
              {totalDensity} kg/m<sup>3</sup>
            </div>
          </CardSummation>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <EditProducts
            allProducts={allProducts}
            enabledProducts={enabledProducts}
            setEnabledProducts={updateEnabledProductsAndCombination}
          />
          <Switch label='Plot' onChange={(e: any) => togglePlot(e)} checked={enabledPlot} size='small' />
        </div>
      </div>
    </Card>
  )
}

export default CombinationCard
