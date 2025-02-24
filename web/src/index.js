import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from 'react-oauth2-code-pkce'
import App from './App'

const authConfig = {
  clientId: process.env.REACT_APP_CLIENT_ID || '',
  authorizationEndpoint: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/v2.0/token',
  redirectUri: window.location.origin,
  scope: process.env.REACT_APP_SCOPES,
  onRefreshTokenExpire: (event) =>
    window.confirm('Session expired. Refresh page to continue using the site?') && event.login(),
}

const container = document.getElementById('root')
const root = createRoot(container) // createRoot(container!) if you use TypeScript
root.render(
  <AuthProvider authConfig={authConfig}>
    <App />
  </AuthProvider>
)
