import React, { useState } from 'react'
// @ts-ignore
import { Button, Dialog, Icon } from '@equinor/eds-core-react'

export const ContactButton = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  return (
    <>
      <Button variant='outlined' onClick={() => setDialogOpen(true)}>
        <Icon name='comment_important' title='filter products' />
        Contact
      </Button>
      <Dialog style={{ width: 'min-content' }} open={dialogOpen}>
        <Dialog.Header>
          <Dialog.Title>Contact and support</Dialog.Title>
        </Dialog.Header>
        <Dialog.CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center', width: '500px' }}>
          <p>
            Questions regarding access and usage of the LCM optimizer can be directed at Ove Braadland{' '}
            <a href={`mailto:${process.env.REACT_APP_APPLICATION_OWNER}`}>{process.env.REACT_APP_APPLICATION_OWNER}</a>
          </p>
          <p>
            Issues and bugs related to the software can be reported on the Github repository
            <a href='https://github.com/equinor/lcm' style={{ padding: '0 5px' }}>
              https://github.com/equinor/lcm
            </a>
          </p>
        </Dialog.CustomContent>
        <Dialog.Actions style={{ width: 'fill-available', display: 'flex', justifySelf: 'center' }}>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </>
  )
}
