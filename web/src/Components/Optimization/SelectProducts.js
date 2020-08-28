import React from "react";
import { Checkbox, LinearProgress } from "@equinor/eds-core-react";
import styled from "styled-components";

const UnstyledList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
`

export default class SelectProducts extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  onChange(id) {
    this.props.updateProductById(id);
  }
  render() {
    if (this.props.loading) {
      return (
        <LinearProgress />
      )
    }
    return (
      <div>
        {Array.from(this.props.productMap.values()).map((product, index) => (
          <UnstyledList>
            <li>
              <Checkbox
                checked={product.enabled}
                onChange={(e) => this.onChange(product.id)}
                label={product.name + ", " + product.supplier}
                name="multiple"
                value="first"
              />
            </li>
          </UnstyledList>
        ))}
      </div>
    );
  }
}