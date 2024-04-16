import React, { useState } from 'react'
// @ts-ignore
import { Button, Dialog, Icon } from '@equinor/eds-core-react'

import { sync_problem } from '@equinor/eds-icons'
import styled from 'styled-components'

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

export const ResetApp = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  return (
    <div>
      <div onClick={() => setDialogOpen(true)} style={{ display: 'flex', alignItems: 'center' }}>
        <Icon data={sync_problem} title='refresh' />
        <div style={{ paddingLeft: '15px' }}>Reset application</div>
      </div>
      <Dialog open={dialogOpen} isDismissable={true} style={{ width: 'min-content', minWidth: '400px' }}>
        <Dialog.Header>
          <Dialog.Title>Reset application</Dialog.Title>
        </Dialog.Header>
        <Dialog.CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
          <div style={{ padding: '20px' }}>
            Are you sure you want to reset the application? This will remove all stored combinations and blends.
          </div>
        </Dialog.CustomContent>
        <Dialog.Actions style={{ width: 'fill-available', display: 'flex', justifySelf: 'normal' }}>
          <ButtonWrapper>
            <Button variant='outlined' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              color='danger'
              onClick={() => {
                window.localStorage.removeItem('combinations')
                window.localStorage.removeItem('selectedSuppliers')
                window.localStorage.removeItem('optimizerProducts')
                window.location.reload()
              }}
            >
              Reset
            </Button>
          </ButtonWrapper>
        </Dialog.Actions>
      </Dialog>
    </div>
  )
}

export default ResetApp
