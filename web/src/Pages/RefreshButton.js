import React, { useState } from 'react'
import { select } from '@storybook/addon-knobs'
import { Dialog, Button, Icon, Scrim, Typography } from '@equinor/eds-core-react'
import styled from "styled-components";
import { refresh } from "@equinor/eds-icons";

const { Actions, Title, CustomContent } = Dialog

const icons = { refresh };


const COLOR = { DANGER: 'danger' };

Icon.add(icons);


const TempButtonWrapper = styled.div`
  display: grid;
  column-gap: 16px;
  grid-template-columns: repeat(2, fit-content(100%));
  justify-content: end;
  justify-self: end;
`

const Placeholder = styled.div`
  background: rgba(255, 146, 0, 0.15);
  border: 1px dashed #ff9200;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  display: inline-block;
`

const TITLE_CHOICES = {
  none: null,
  text: 'Warning',
  color: "danger",
}

const CUSTOM_CONTENT_CHOICES = {
  none: null,
  empty: <Placeholder>Custom content</Placeholder>,
  emptyLarge: (
    <Placeholder>
      Custom content in a larger placeholder. No actions, only ESC or timedelay?
      Test testestsetsest
    </Placeholder>
  ),
  description: (
    <Typography variant="body_short">Use the refresh button if you have manually added new products to SharePoint. Pulling data will take a few minutes so please be patient. You will need to refresh the page to update product list.</Typography>
  ),

}

const ACTION_CHOICES = {
  none: null,
  buttons: (
    <TempButtonWrapper>
      <Button>OK</Button>
      <Button variant="ghost">Cancel</Button>
    </TempButtonWrapper>
  ),
}

export const RefreshButton = () => {

  const [visibleScrim, setVisibleScrim] = useState(false)
  const handleClose = (event, closed) => {
    setVisibleScrim(!visibleScrim)
  }

  const callHttpTrigger = () => {
    fetch("https://prod-10.northeurope.logic.azure.com:443/workflows/cbc8e9fd48df4f8db2c1a32149e29af0/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=qnD24LqvPoCms52pK_E4G-wslzVElxjUiaE8Cb9qPjI")
      .then((response) => {
        return response;
      })
  }

  const titleChoice = select('Title', [...Object.keys(TITLE_CHOICES)], 'text')
  const contentChoice = select(
    'CustomContent',
    [...Object.keys(CUSTOM_CONTENT_CHOICES)],
    'description',
  )

  const actionsChoice = select(
    'Actions',
    [...Object.keys(ACTION_CHOICES)],
    'buttons',
  )

  return (
    <div>
      <Button variant="outlined" onClick={() => setVisibleScrim(true)}>
        <Icon name="refresh" title="refresh" size={48}></Icon>
        Syncronize product list with SharePoint
      </Button>
      {visibleScrim && (
        <Scrim onClose={handleClose}>
          <Dialog>
            <Title>{TITLE_CHOICES[titleChoice]}</Title>
            <CustomContent
              scrollable={contentChoice === 'scroll' ? true : false}
            >
              {CUSTOM_CONTENT_CHOICES[contentChoice]}
            </CustomContent>
            <Actions>
              {actionsChoice === 'buttons' ? (
                <TempButtonWrapper>
                  <Button
                    variant="ghost"
                    onClick={() => setVisibleScrim(false)}
                  >
                    Cancel
              </Button>
                  <Button color="danger" variant="ghost" onClick={() => setVisibleScrim(false) + callHttpTrigger()}>Commit</Button>
                  {/*Change alert to function that triggers url */}
                </TempButtonWrapper>
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

export default RefreshButton;