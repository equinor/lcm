import React from 'react'
// @ts-ignore
import {Card, Button, Icon, TextField} from '@equinor/eds-core-react'
import CombinationTable from './CombinationTable'

const {CardHeader, CardHeaderTitle} = Card

interface CombinationCardProps {
    sacks: any
    combination: any
    updateCombination: any
    updateCombinationName: any
    removeCombination: any
    products: any
    enabledProducts: any
}

export const CombinationCard = ({sacks, products, enabledProducts, combination, updateCombination,
                                    updateCombinationName, removeCombination}: CombinationCardProps) => {

    const handleUpdateCombination = (productId: string, value: any) => {
        updateCombination(combination.id, productId, value)
    }

    const handleUpdateCombinationName = (event: any) => {
        updateCombinationName(combination.id, event.target.value)
    }

    return (
        <Card style={{width: 'fit-content', display: 'inline-block', margin: "10px", padding: "20px"}}>
            <CardHeader style={{display: 'inline-flex', height: '50px'}}>
                <CardHeaderTitle>
                    <TextField
                        id={`${combination.id}`}
                        value={combination.name}
                        style={{background: "transparent"}}
                        onChange={(event: any) =>
                            handleUpdateCombinationName(event)}
                    />
                </CardHeaderTitle>
                <Button
                    variant="ghost_icon"
                    color="danger"
                    onClick={(event: any) =>
                        removeCombination(combination.id)}>
                    <Icon name="close" title="close"></Icon>
                </Button>
            </CardHeader>
            <CombinationTable
                sacks={sacks}
                products={products}
                enabledProducts={enabledProducts}
                combination={combination}
                updateCombination={handleUpdateCombination}/>
        </Card>
    )
}

export default CombinationCard

