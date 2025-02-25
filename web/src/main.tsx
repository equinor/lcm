import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider, type TAuthConfig } from 'react-oauth2-code-pkce'
import App from './App'

const authConfig: TAuthConfig = {
  clientId: import.meta.env.VITE_CLIENT_ID || '',
  authorizationEndpoint: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/v2.0/token',
  redirectUri: window.location.origin,
  scope: import.meta.env.VITE_SCOPES,
  onRefreshTokenExpire: (event) =>
    window.confirm('Session expired. Refresh page to continue using the site?') && event.login(),
}

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
  <AuthProvider authConfig={authConfig}>
    <App />
  </AuthProvider>
)
