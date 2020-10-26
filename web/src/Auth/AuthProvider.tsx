// From https://docs.microsoft.com/en-us/graph/tutorials/react?tutorial-step=3
import React, { createContext } from 'react'
import { PublicClientApplication } from '@azure/msal-browser'

export interface AuthComponentProps {
  error: any
  isAuthenticated: boolean
  user: any
  login: Function
  logout: Function
  getAccessToken: Function
  setError: Function
}

interface AuthProviderState {
  error: any
  isAuthenticated: boolean
  user: any
}

const config = {
  appId: '1dbc1e96-268d-41ad-894a-92a9fb85f954',
  redirectUri: window.location.origin,
  scopes: ['api://lost-circulation-material-api/Optimization.All.All'],
}

export default function withAuthProvider<T extends React.Component<AuthComponentProps>>(
  WrappedComponent: new (props: AuthComponentProps, context?: any) => T
): React.ComponentClass {
  return class extends React.Component<any, AuthProviderState> {
    private publicClientApplication: PublicClientApplication

    constructor(props: any) {
      super(props)
      this.state = {
        error: null,
        isAuthenticated: false,
        user: {},
      }

      // Initialize the MSAL application object
      this.publicClientApplication = new PublicClientApplication({
        auth: {
          clientId: config.appId,
          redirectUri: config.redirectUri,
          authority: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/',
        },
        cache: {
          cacheLocation: 'sessionStorage',
          storeAuthStateInCookie: true,
        },
      })
    }

    componentDidMount() {
      // If MSAL already has an account, the user
      // is already logged in
      const accounts = this.publicClientApplication.getAllAccounts()

      if (accounts && accounts.length > 0) {
        this.getUserProfile()
      }
    }

    render() {
      return (
        <WrappedComponent
          // @ts-ignore
          error={this.state.error}
          // @ts-ignore
          isAuthenticated={this.state.isAuthenticated}
          // @ts-ignore
          user={this.state.user}
          login={() => this.login()}
          logout={() => this.logout()}
          getAccessToken={() => this.getAccessToken()}
          setError={(message: string, debug: string) => this.setErrorMessage(message, debug)}
          {...this.props}
          {...this.state}
        />
      )
    }

    async login() {
      try {
        // Login via popup
        await this.publicClientApplication.loginPopup({
          scopes: config.scopes,
          prompt: 'select_account',
        })

        // After login, get the user's profile
        await this.getUserProfile()
      } catch (err) {
        this.setState({
          isAuthenticated: false,
          user: {},
          error: this.normalizeError(err),
        })
      }
    }

    logout() {
      this.publicClientApplication.logout()
    }

    async getAccessToken(): Promise<string> {
      try {
        const accounts = this.publicClientApplication.getAllAccounts()

        if (accounts.length <= 0) throw new Error('login_required')
        // Get the access token silently
        // If the cache contains a non-expired token, this function
        // will just return the cached token. Otherwise, it will
        // make a request to the Azure OAuth endpoint to get a token
        var silentResult = await this.publicClientApplication.acquireTokenSilent({
          scopes: config.scopes,
          account: accounts[0],
        })

        return silentResult.accessToken
      } catch (err) {
        // If a silent request fails, it may be because the user needs
        // to login or grant consent to one or more of the requested scopes
        if (this.isInteractionRequired(err)) {
          var interactiveResult = await this.publicClientApplication.acquireTokenPopup({
            scopes: config.scopes,
          })

          return interactiveResult.accessToken
        } else {
          throw err
        }
      }
    }

    async getUserProfile() {
      try {
        var accessToken = await this.getAccessToken()

        if (accessToken) {
          this.setState({
            isAuthenticated: true,
            user: { accessToken: accessToken },
            error: { message: 'Access token:', debug: accessToken },
          })
        }
      } catch (err) {
        this.setState({
          isAuthenticated: false,
          user: {},
          error: this.normalizeError(err),
        })
      }
    }

    setErrorMessage(message: string, debug: string) {
      this.setState({
        error: { message: message, debug: debug },
      })
    }

    normalizeError(error: string | Error): any {
      var normalizedError = {}
      if (typeof error === 'string') {
        var errParts = error.split('|')
        normalizedError = errParts.length > 1 ? { message: errParts[1], debug: errParts[0] } : { message: error }
      } else {
        normalizedError = {
          message: error.message,
          debug: JSON.stringify(error),
        }
      }
      return normalizedError
    }

    isInteractionRequired(error: Error): boolean {
      if (!error.message || error.message.length <= 0) {
        return false
      }

      return (
        error.message.indexOf('consent_required') > -1 ||
        error.message.indexOf('interaction_required') > -1 ||
        error.message.indexOf('login_required') > -1 ||
        error.message.indexOf('no_account_in_silent_request') > -1
      )
    }
  }
}

interface User {
  token: string
}

export const AuthContext = createContext<User>({ token: '' })
