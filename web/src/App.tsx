import React, { useEffect, useState } from 'react'

import './App.css'
import Main from './Components/Main'
import './Components/icons'
import { AuthComponentProps, AuthContext } from './Auth/AuthProvider'
import withAuthProvider from './Auth/AuthProvider'

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

function App({ isAuthenticated, getAccessToken }: AuthComponentProps) {
  const [loginError, setLoginError] = useState<LoginError>({})
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    getAccessToken()
      .then((token: string) => {
        setToken(token)
        setLoginError({})
      })
      .catch((e: any) => {
        setLoginError(e)
      })
  }, [isAuthenticated])

  if (token) {
    return (
      <AuthContext.Provider value={{ token: token }}>
        <Main />
      </AuthContext.Provider>
    )
  }
  if (loginError?.errorCode === 'interaction_in_progress') {
    return null
  }
  if (loginError?.errorMessage) {
    return <LoginError errorMessage={loginError.errorMessage} hint={'Try clearing cache and reloading the page'} />
  }
  return null
}

// @ts-ignore
export default withAuthProvider(App)
