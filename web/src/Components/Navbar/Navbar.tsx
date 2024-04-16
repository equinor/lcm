import { Button, Icon, Menu, TopBar, Typography } from '@equinor/eds-core-react'
import RefreshButton from './RefreshButton'
import { ContactButton } from './ContactButton'
import { external_link, menu } from '@equinor/eds-icons'
import { StyledLink } from './styles'
import CreateProduct from './CreateProduct'
import { useState } from 'react'
import ResetApp from './ResetAppData'
import ResetAppData from './ResetAppData'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  return (
    <TopBar>
      <TopBar.Header>
        <Typography variant='h2'>LCM Optimizer</Typography>
      </TopBar.Header>
      <TopBar.Actions>
        <Button variant='ghost_icon' onClick={() => setIsMenuOpen(!isMenuOpen)} ref={setAnchorEl}>
          <Icon data={menu} />
        </Button>
        <Menu
          open={isMenuOpen}
          id='menu-default'
          aria-labelledby='anchor-default'
          onClose={() => setIsMenuOpen(false)}
          anchorEl={anchorEl}
        >
          <Menu.Item>
            <Icon data={external_link} title='info_circle' />
            <StyledLink
              href='https://statoilsrm.sharepoint.com/sites/LCMlibrary/Lists/Product'
              target='_blank'
              rel='noopener noreferrer'
            >
              LCM Library SharePoint
            </StyledLink>
          </Menu.Item>
          <Menu.Item>
            <ContactButton />
          </Menu.Item>
          <Menu.Item>
            <CreateProduct />
          </Menu.Item>
          <Menu.Item>
            <RefreshButton />
          </Menu.Item>
          <Menu.Item>
            <ResetAppData />
          </Menu.Item>
        </Menu>
      </TopBar.Actions>
    </TopBar>
  )
}

export default Navbar
