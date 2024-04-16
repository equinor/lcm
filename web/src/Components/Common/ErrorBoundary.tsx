import { Icon, List, Typography } from '@equinor/eds-core-react'
import { account_circle } from '@equinor/eds-icons'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  // public state: State = {
  //   hasError: false,
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Typography variant={'h3'}>Ops... Something went wrong 😞</Typography>
          <Typography variant={'body_short'}>You should try the following:</Typography>
          <List variant='numbered' style={{ lineHeight: '2.25rem' }}>
            <List.Item>Refresh the page (F5)</List.Item>
            <List.Item>
              Resetting the application by clicking the <Icon data={account_circle} /> icon, and then{' '}
              <i>&quot;reset application data&quot;</i>.
            </List.Item>
            <List.Item>
              Contact technical support by email at{' '}
              <a href={'mailto:fg_team_hermes@equinor.com'}>fg_team_hermes@equinor.com</a>
            </List.Item>
          </List>
        </>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
