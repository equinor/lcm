import { Button, Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { info_circle } from '@equinor/eds-icons'
import { ContactButton } from './ContactButton'
import RefreshButton from './RefreshButton'
import { StyledLink } from './styles'

const Navbar = () => {
  return (
    <TopBar>
      <TopBar.Header>
        <Typography variant="h2">LCM Optimizer</Typography>
      </TopBar.Header>
      <TopBar.Actions>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, fit-content(100%))',
            gap: '16px',
          }}
        >
          <div>
            <StyledLink
              href="https://statoilsrm.sharepoint.com/sites/LCMlibrary/Lists/Product"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outlined">
                <Icon data={info_circle} title="info_circle" />
                LCM Library SharePoint
              </Button>
            </StyledLink>
          </div>
          <RefreshButton />
          <div>
            <ContactButton />
          </div>
        </div>
      </TopBar.Actions>
    </TopBar>
  )
}

export default Navbar
