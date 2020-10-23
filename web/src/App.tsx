import React, { useEffect, useState } from 'react'

import './App.css'
import Main from './Components/Main'
import './Components/icons'
import withAuthProvider, { AuthComponentProps, AuthContext } from './Auth/AuthProvider'

interface LoginError {
  errorCode?: string
  errorMessage?: string
  message?: string
}

const LoginError = ({ errorMessage, hint }: any) => {
  return (
    <div style={{ margin: '100px', textAlign: 'center' }}>
      <p>Failed to login to Azure AD</p>
      <p>{hint}</p>
      <b>
        Error message:
        <pre>{errorMessage}</pre>
      </b>
    </div>
  )
}

function App({ isAuthenticated, user, getAccessToken }: AuthComponentProps) {
  const [loginError, setLoginError] = useState<LoginError>({})
  const [authenticated, setAuthenticated] = useState<boolean>(isAuthenticated)

  useEffect(() => {
    getAccessToken()
      .then(() => {
        setAuthenticated(true)
        setLoginError({})
      })
      .catch((e: any) => {
        setLoginError(e)
        console.error(e)
      })
  }, [isAuthenticated, user])

  if (authenticated) {
    return (
      <AuthContext.Provider value={{ token: user.accessToken }}>
        <Main />
      </AuthContext.Provider>
    )
  }
  if (loginError?.errorCode === 'popup_window_error') {
    return (
      <LoginError errorMessage={loginError.errorMessage} hint={'The login popup window was blocked by the browser'} />
    )
  }
  if (loginError?.errorCode === 'user_cancelled') {
    return (
      <LoginError
        errorMessage={loginError.errorMessage}
        hint={'The login process was cancelled. Please reload the page'}
      />
    )
  }
  if (loginError?.errorMessage) {
    return <LoginError errorMessage={loginError.errorMessage} hint={'Try clearing cache and reloading the page'} />
  }
  return (
    <div style={{ margin: '100px', textAlign: 'center' }}>
      <p>Logging into Azure AD...</p>
      <p>Follow directions in the popup window</p>
    </div>
  )
}

// @ts-ignore
export default withAuthProvider(App)
