import { Button, CircularProgress, Dialog, Icon } from '@equinor/eds-core-react'
import { useContext, useState } from 'react'

import { refresh } from '@equinor/eds-icons'
import { AuthContext } from 'react-oauth2-code-pkce'
import type { IAuthContext } from 'react-oauth2-code-pkce'
import styled from 'styled-components'
import { SyncAPI } from '../../Api'
import { ErrorToast } from '../Common/Toast'

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

export const RefreshButton = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { token }: IAuthContext = useContext(AuthContext)

  const syncSharePoint = () => {
    SyncAPI.postSyncApi(token)
      .then(() => {
        setLoading(false)
        window.location.reload()
      })
      .catch((error) => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error(`fetch error ${error}`)
        setLoading(false)
      })
  }

  return (
    <>
      <Button variant="outlined" onClick={() => setDialogOpen(true)}>
        <Icon data={refresh} title="refresh" />
        Synchronize with SharePoint
      </Button>
      <Dialog style={{ width: 'min-content' }} open={dialogOpen} isDismissable={true}>
        <Dialog.Header>
          <Dialog.Title>Synchronize SharePoint data</Dialog.Title>
        </Dialog.Header>
        <Dialog.CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
          <p>
            This will synchronize products distribution and products metadata from SharePoint (
            <a href="https://statoilsrm.sharepoint.com/sites/LCMTeamBlend">
              https://statoilsrm.sharepoint.com/sites/LCMTeamBlend
            </a>
            )
          </p>
          <p>
            The sync job will take approximately 1 minute, and the LCM App will be <b>unavailable</b> during this time.
          </p>
          {loading && <CircularProgress />}
        </Dialog.CustomContent>
        <Dialog.Actions
          style={{
            width: 'fill-available',
            display: 'flex',
            justifySelf: 'normal',
          }}
        >
          <ButtonWrapper>
            <Button onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              color="danger"
              disabled={loading}
              onClick={() => {
                setLoading(true)
                syncSharePoint()
              }}
            >
              Sync Now
            </Button>
          </ButtonWrapper>
        </Dialog.Actions>
      </Dialog>
    </>
  )
}

export default RefreshButton
