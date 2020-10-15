import { IAccountInfo, LoginType, MsalAuthProvider } from 'react-aad-msal'
import { createContext } from 'react'

// Msal Configurations
const config = {
  auth: {
    authority: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/',
    clientId: '1dbc1e96-268d-41ad-894a-92a9fb85f954',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
}

// Authentication Parameters
const authenticationParameters = {
  scopes: ['api://lost-circulation-material-api/Optimization.All.All'],
}

// Options
const options = {
  loginType: LoginType.Redirect,
  tokenRefreshUri: window.location.origin + '/auth.html',
}

// @ts-ignore
export const authProvider = new MsalAuthProvider(config, authenticationParameters, options)
// @ts-ignore
export const AuthContext = createContext<IAccountInfo>(null)
