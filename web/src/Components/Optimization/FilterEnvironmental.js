import React from 'react'
import { Checkbox } from '@equinor/eds-core-react'
import styled from 'styled-components'

const UnstyledList = styled.ul`
  margin: 0px;
  padding: 0px;
  list-style-type: none;
`
const Wrapper = styled.div`
  margin: 0px;
  display: grid;
  grid-gap: 0px;
  grid-template-columns: repeat(4, 195px);
`

export const FilterEnvironmental = () => {
  return (
    <div>
      {
        <UnstyledList>
          <Wrapper>
            <li>
              <Checkbox label="Green" name="multiple" value="Green" defaultChecked />
            </li>
            <li>
              <Checkbox label="Yellow" name="multiple" value="Yellow" defaultChecked />
            </li>
            <li>
              <Checkbox label="Red" name="multiple" value="Red" defaultChecked />
            </li>
            <li>
              <Checkbox label="Black" name="multiple" value="Black" defaultChecked />
            </li>
          </Wrapper>
        </UnstyledList>
      }
    </div>
  )
}

export default FilterEnvironmental
