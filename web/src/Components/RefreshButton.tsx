import React, { useContext, useState } from 'react'
// @ts-ignore
import { Button, Dialog, Icon, Scrim, CircularProgress } from '@equinor/eds-core-react'
// @ts-ignore
import { refresh } from '@equinor/eds-icons'
import { SyncAPI } from '../Api'
import styled from 'styled-components'
import { AuthContext } from '../Auth/Auth'

const { Actions, Title, CustomContent } = Dialog

const icons = { refresh }

Icon.add(icons)

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

export const RefreshButton = () => {
  const [scrim, setScrim] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const apiToken: string = useContext(AuthContext)?.jwtIdToken

  const syncSharePoint = () => {
    SyncAPI.postSyncApi(apiToken)
      .then(() => {
        setLoading(false)
        window.location.reload(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  return (
    <>
      <Button variant="outlined" onClick={() => setScrim(true)}>
        <Icon name="refresh" title="refresh" size={48} />
        Syncronize SharePoint data with LCM App
      </Button>
      {scrim && (
        <Scrim onClose={() => setScrim(false)}>
          <Dialog style={{ width: 'min-content' }}>
            <Title>Synchronize SharePoint data</Title>
            <CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
              <p>
                This will synchronize products distribution and products metadata from SharePoint (
                <a href="https://statoilsrm.sharepoint.com/sites/LCMTeamBlend">
                  https://statoilsrm.sharepoint.com/sites/LCMTeamBlend
                </a>
                )
              </p>
              <p>
                The sync job will take approximately 1 minute, and the LCM App will be <b>unavailable</b> during this
                time.
              </p>
              {loading && <CircularProgress />}
            </CustomContent>
            <Actions style={{ width: '-webkit-fill-available' }}>
              <ButtonWrapper>
                <Button onClick={() => setScrim(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  disabled={loading}
                  onClick={() => {
                    setLoading(true)
                    syncSharePoint()
                  }}>
                  Sync Now
                </Button>
              </ButtonWrapper>
            </Actions>
          </Dialog>
        </Scrim>
      )}
    </>
  )
}

export default RefreshButton
