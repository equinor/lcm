// From https://docs.microsoft.com/en-us/graph/tutorials/react?tutorial-step=3
import React from 'react'
import { PublicClientApplication } from '@azure/msal-browser'

export interface AuthComponentProps {
  msalError: any
  isAuthenticated: boolean
  getAccessToken: Function
}

interface AuthProviderState {
  error: any
  isAuthenticated: boolean
}

const scopes = ['api://lost-circulation-material-api/Optimization.All.All']

const config = {
  auth: {
    clientId: '1dbc1e96-268d-41ad-894a-92a9fb85f954',
    redirectUri: window.location.origin,
    authority: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
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
      }
      // Initialize the MSAL application object
      this.publicClientApplication = new PublicClientApplication(config)
      this.publicClientApplication
        .handleRedirectPromise()
        .then(this.handleResponse.bind(this))
        .catch(err => this.setState({ error: err }))
    }

    handleResponse(resp: any) {
      if (resp !== null) {
        this.setState({ isAuthenticated: true })
      }
      // TODO: This doesn't seem to do anything...
      // else {
      //   const currentAccounts = this.publicClientApplication.getAllAccounts()
      //   if (!currentAccounts || currentAccounts.length < 1) {
      //     return
      //   } else if (currentAccounts.length > 1) {
      //     // Add choose account code here
      //   } else if (currentAccounts.length === 1) {
      //   }
      // }
    }

    render() {
      return (
        <WrappedComponent
          msalError={this.state.error}
          isAuthenticated={this.state.isAuthenticated}
          getAccessToken={() => this.getAccessToken()}
        />
      )
    }

    async getAccessToken(): Promise<object> {
      try {
        const accounts = this.publicClientApplication.getAllAccounts()

        if (accounts.length <= 0) throw new Error('login_required')
        // Get the access token silently
        // If the cache contains a non-expired token, this function
        // will just return the cached token. Otherwise, it will
        // make a request to the Azure OAuth endpoint to get a token
        let silentResult = await this.publicClientApplication.acquireTokenSilent({
          scopes: scopes,
          account: accounts[0],
        })
        return silentResult
      } catch (err) {
        // If a silent request fails, it may be because the user needs
        // to login or grant consent to one or more of the requested scopes
        if (this.isInteractionRequired(err)) {
          let interactiveResult = await this.publicClientApplication.acquireTokenRedirect({
            redirectStartPage: window.location.href,
            scopes: scopes,
          })
          // @ts-ignore
          return interactiveResult
        } else {
          throw err
        }
      }
    }

    setErrorMessage(message: string, debug: string) {
      this.setState({
        error: { message: message, debug: debug },
      })
    }

    normalizeError(error: string | Error): any {
      let normalizedError = {}
      if (typeof error === 'string') {
        let errParts = error.split('|')
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
