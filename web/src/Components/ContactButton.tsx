import React, { useState } from 'react'
// @ts-ignore
import { Button, Dialog, Icon, Scrim } from '@equinor/eds-core-react'

const { Actions, Title, CustomContent } = Dialog

export const ContactButton = () => {
  const [scrim, setScrim] = useState<boolean>(false)

  return (
    <>
      <Button variant='outlined' onClick={() => setScrim(true)}>
        <Icon name='comment_important' title='filter products' />
        Contact
      </Button>
      {scrim && (
        <Scrim onClose={() => setScrim(false)}>
          <Dialog style={{ width: 'min-content' }}>
            <Title>Contact and support</Title>
            <CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center', width: '500px' }}>
              <p>
                Questions regarding access and usage of the LCM optimizer can be directed at Ove Braadland{' '}
                <a href={`mailto:${process.env.REACT_APP_APPLICATION_OWNER}`}>
                  {process.env.REACT_APP_APPLICATION_OWNER}
                </a>
              </p>
              <p>
                Issues and bugs related to the software can be reported on the Github repository
                <a href='https://github.com/equinor/lcm' style={{ padding: '0 5px' }}>
                  https://github.com/equinor/lcm
                </a>
              </p>
            </CustomContent>
            <Actions style={{ width: 'fill-available', display: 'flex', justifySelf: 'center' }}>
              <Button onClick={() => setScrim(false)}>Close</Button>
            </Actions>
          </Dialog>
        </Scrim>
      )}
    </>
  )
}
