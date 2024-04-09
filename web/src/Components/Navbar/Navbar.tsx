import { Button, Icon, TopBar, Typography } from '@equinor/eds-core-react'
import RefreshButton from './RefreshButton'
import { ContactButton } from './ContactButton'
import { info_circle } from '@equinor/eds-icons'
import { StyledLink } from './styles'
import CreateProduct from './CreateProduct'

const Navbar = () => {
  return (
    <TopBar>
      <TopBar.Header>
        <Typography variant='h2'>LCM Optimizer</Typography>
      </TopBar.Header>
      <TopBar.Actions>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, fit-content(100%))',
            gap: '16px',
          }}
        >
          <div>
            <StyledLink
              href='https://statoilsrm.sharepoint.com/sites/LCMlibrary/Lists/Product'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button variant='outlined'>
                <Icon data={info_circle} title='info_circle' />
                LCM Library SharePoint
              </Button>
            </StyledLink>
          </div>
          <CreateProduct />
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
