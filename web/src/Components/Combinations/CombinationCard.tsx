import { Button, Icon, Input, Switch, Tooltip } from '@equinor/eds-core-react'
import { delete_to_trash, edit } from '@equinor/eds-icons'
import { useContext, useEffect, useState } from 'react'
import { AuthContext, type IAuthContext } from 'react-oauth2-code-pkce'
import styled from 'styled-components'
import { CombinationAPI } from '../../Api'
import type { Bridge, Combination, GraphData, Product, Products } from '../../Types'
import { findDValue, findGraphData } from '../../Utils'
import EditProducts from '../Common/EditProducts'
import { ErrorToast } from '../Common/Toast'
import { Card } from './CardContainer'
import CombinationTable from './CombinationTable'

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
  updateCombination: (c: Combination) => void
  renameCombination: (id: string, name: string) => void
  removeCombination: (id: string) => void
  removeBridge: (id: string) => void
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
    Object.values(combination.values).forEach((prod) => {
      newEnabledProducts = {
        ...newEnabledProducts,
        [prod.id]: allProducts[prod.id],
      }
    })
    setEnabledProducts(newEnabledProducts)
  }, [allProducts])

  // Calculate sum of mass in combination on combination change
  useEffect(() => {
    if (!(Object.keys(allProducts).length > 0)) return
    let newMass = 0
    let newDensity = 0
    Object.values(combination.values).forEach((prod) => {
      newMass += allProducts[prod.id].sackSize * prod.value
      newDensity += prod.value
    })
    if (sacks) {
      setTotalMass(newMass)
    } else {
      setTotalDensity(Math.round(newDensity * 10) / 10)
    }

    CombinationAPI.postCombinationApi(token, Object.values(combination.values))
      .then((response) => {
        const newBridge: Bridge = {
          ...bridge,
          [combination.name]: response.data.bridge,
        }
        setBridge(newBridge)
        const graphData: GraphData[] = findGraphData(sizeFractions, newBridge)
        setD10(findDValue(graphData, 10, combination.name))
        setD50(findDValue(graphData, 50, combination.name))
        setD90(findDValue(graphData, 90, combination.name))
      })
      .catch((error) => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(`fetch error ${error}`)
      })
  }, [combination, allProducts])

  function updateEnabledProductsAndCombination(changedProducts: Products) {
    setEnabledProducts(changedProducts)

    const newCombination: Combination = { ...combination }
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

  function togglePlot(e: React.ChangeEvent<HTMLInputElement>) {
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
            <Button variant="ghost_icon" onClick={() => setIsHeaderEditable(!isHeaderEditable)}>
              <Icon data={edit} size={16} style={{ width: '40px' }} />
            </Button>
          </Tooltip>
          <Input
            id={`${combination.name}`}
            value={combinationName}
            readOnly={!isHeaderEditable}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCombinationName(event.target.value)
            }}
            onBlur={() => {
              renameCombination(combinationName, combination.name)
            }}
            onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                ;(document.activeElement as HTMLElement).blur()
              }
            }}
          />
          <Tooltip title={'Delete combination'}>
            <Button variant="ghost_icon" color="danger" onClick={() => removeCombination(combination.name)}>
              <Icon data={delete_to_trash} title="close" style={{ width: '40px' }} />
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
          <div />
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <EditProducts
            allProducts={allProducts}
            enabledProducts={enabledProducts}
            setEnabledProducts={updateEnabledProductsAndCombination}
          />
          <Switch
            label="Plot"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => togglePlot(e)}
            checked={enabledPlot}
            size="small"
          />
        </div>
      </div>
    </Card>
  )
}

export default CombinationCard
