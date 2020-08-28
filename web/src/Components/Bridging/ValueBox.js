import React from 'react';
import { TextField } from '@equinor/eds-core-react';
import styled from 'styled-components'

const Wrapper = styled.div`
  margin: 32px;
  display: grid;
  grid-gap: 32px;
  grid-template-columns: repeat(2, fit-content(100%));
`

const ValueBox = () => (
    <Wrapper>
    <TextField
        type="number"
        id="textfield-number"
        placeholder="Placeholder text"
        label="Enter value:"
        meta="mD"
    />
    </Wrapper>
)
export default ValueBox