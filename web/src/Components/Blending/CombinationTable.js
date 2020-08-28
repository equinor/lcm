import React from 'react'
import { Table, TextField } from '@equinor/eds-core-react'

const { Body, Row, Cell, Head } = Table

export default class CombinationTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      populatedValues: false,
      values: []
    }
    this.onNewValue = this.onNewValue.bind(this)
  }

  onNewValue(event, productId) {
    this.props.updateCombination(productId, event.target.value)
  }

  render() {
    return (
      <div className="container">
        <div className="group">
          <Table>
            <Head>
              <Row style={{ height: '60px' }}>
                <Cell as="th" scope="col">
                  {this.props.sacks ? (
                    <p>Sacks</p>
                  ) : (
                      <p>Blend (ppg or kg/m3)</p>
                    )
                  }
                </Cell>
                <Cell as="th" scope="col">
                  %
                </Cell>
              </Row>
            </Head>
            <Body>
              {(this.props.fetched && this.props.productMap.length !== 0) ? Array.from(this.props.productMap.values()).map((product, index) =>
                product.enabled ? (
                  <Row>
                    <Cell>
                      <TextField
                        value={(this.props.combination.values.has(product.id)) ? this.props.combination.values.get(product.id).value : ""}
                        type="number"
                        placeholder={this.props.sacks ? "Sacks (" + product.sack_size + "kg)" : "Number of units"}
                        onChange={event => {
                          this.onNewValue(event, product.id);
                        }}
                        style={{background:'transparent'}}
                      />
                    </Cell>
                    <Cell>{((this.props.combination.values.has(product.id) ? this.props.combination.values.get(product.id).percentage : 0)).toFixed(1)}
                    </Cell>
                  </Row>
                ) : ""
              ) : ""
              }
            </Body>
          </Table>
        </div>
      </div>
    )
  }


}