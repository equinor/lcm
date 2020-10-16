import React, { useState } from 'react'
import { select } from '@storybook/addon-knobs'
import { Dialog, Button, Scrim, Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'

const { Actions, Title } = Dialog

const TITLE_CHOICES = {
  none: null,
  text: 'Solution',
}

const ACTION_CHOICES = {
  none: null,
  buttons: <Button>OK</Button>,
}

const Wrapper = styled.div`
  padding: 20px;
`

export const ExportButton = ({ fetched, loading, optimizationData, productMap }) => {
  const [visibleScrim, setVisibleScrim] = useState(false)
  const handleClose = (event, closed) => {
    setVisibleScrim(!visibleScrim)
  }

  const titleChoice = select('Title', [...Object.keys(TITLE_CHOICES)], 'text')

  const actionsChoice = select('Actions', [...Object.keys(ACTION_CHOICES)], 'buttons')

  function getTotalMass() {
    var products = optimizationData.products
    var totalMass = 0
    if (products && products.length !== 0) {
      products.map(product => {
        totalMass += product.sacks * productMap.get(product.id).sack_size
      })
    }
    return totalMass
  }

  return (
    <div>
      <Button onClick={() => setVisibleScrim(true)}>Export solution</Button>
      {visibleScrim && (
        <Scrim onClose={handleClose}>
          <Dialog>
            <Title>{TITLE_CHOICES[titleChoice]}</Title>
            <div>
              <Wrapper>
                <Typography variant="body_short" bold>
                  Optimal blend:{' '}
                </Typography>
                {fetched && optimizationData && optimizationData.products && optimizationData.products.length !== 0 ? (
                  optimizationData.products.map(
                    product =>
                      product.sacks !== 0 && (
                        <div>
                          <Typography variant="body_short">{productMap.get(product.id).name}: </Typography>
                          <Typography variant="body_short">{product.sacks} sacks</Typography>
                        </div>
                      )
                  )
                ) : (
                  <Typography variant="body_short" style={{ color: '#EC462F' }}>
                    No solution found
                  </Typography>
                )}
                {fetched && optimizationData ? (
                  <div>
                    <Typography variant="body_short" bold>
                      Total mass:{' '}
                    </Typography>
                    <Typography variant="body_short">{getTotalMass()} kg</Typography>
                    <Typography variant="body_short" bold>
                      Fit:{' '}
                    </Typography>
                    <Typography variant="body_short">{optimizationData.performance.best_fit} %</Typography>
                  </div>
                ) : (
                  ''
                )}
              </Wrapper>
            </div>
            <Actions>
              {actionsChoice === 'buttons' ? (
                <Button variant="ghost" onClick={() => setVisibleScrim(false)}>
                  OK
                </Button>
              ) : (
                ACTION_CHOICES[actionsChoice]
              )}
            </Actions>
          </Dialog>
        </Scrim>
      )}
    </div>
  )
}

export default ExportButton
