import React, { useState } from 'react'
// @ts-ignore
import { Button, Dialog, Icon, Scrim } from '@equinor/eds-core-react'
// @ts-ignore
import { comment_important } from '@equinor/eds-icons'

const { Actions, Title, CustomContent } = Dialog

Icon.add({ comment_important })

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
            <CustomContent>
              <p>
                Questions regarding access and usage of the LCM optimizer can be directed at John-Morten Godhavn{' '}
                <a href='mailto:jmgo@equinor.com'>jmgo@equinor.com</a>
              </p>
              <p>
                Issues and bugs related to the software can be reported on the Github repository
                <a href='https://github.com/equinor/lcm' style={{ padding: '0 5px' }}>
                  https://github.com/equinor/lcm
                </a>
              </p>
            </CustomContent>
            <Actions>
              <Button onClick={() => setScrim(false)}>Close</Button>
            </Actions>
          </Dialog>
        </Scrim>
      )}
    </>
  )
}
