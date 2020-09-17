import React, {ReactElement} from "react";
// @ts-ignore
import {Checkbox, LinearProgress} from "@equinor/eds-core-react";
import styled from "styled-components";
import {Product} from "../../gen-api/src/models";

const UnstyledList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
`

interface SelectProductsProps {
    loading: boolean
    products: any // TODO: fix better
    enabledProducts: any // TODO: fix better
    setEnabledProducts: Function
}


export const SelectProducts = ({loading, products, enabledProducts, setEnabledProducts}: SelectProductsProps): ReactElement => {
    if (loading) return <LinearProgress/>

    const handleChange = (productId: string, isChecked: boolean) => {
        if (isChecked) {
            setEnabledProducts(enabledProducts.filter((enabled: string) => enabled !== productId))
        } else {
            setEnabledProducts([...enabledProducts, productId])
        }
    }

    const productList: Array<Product> = Object.values(products);

    return (
        <div>
            <UnstyledList>
                {productList.map((product, key) => {
                    const label = product["id"] + ", " + product["supplier"]
                    const isChecked = enabledProducts.includes(product["id"])
                    return (
                        <li key={key}>
                            <Checkbox
                                checked={isChecked}
                                onChange={() => handleChange(product["id"], isChecked)}
                                label={label}
                                name="multiple"
                                value="first"
                            />
                        </li>
                    )
                })}
            </UnstyledList>
        </div>
    );
}

export default SelectProducts