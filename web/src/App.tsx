import React, { useEffect, useState } from 'react'

import Main from './Pages/Main'
import { AuthComponentProps } from './Auth/AuthProvider'
import withAuthProvider from './Auth/AuthProvider'

import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { AuthContext, ParticleSizeContext } from './Context'

interface ILoginError {
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

const AccessDenied = ({ errorMessage, hint }: any) => {
  return (
    <div style={{ margin: '100px', textAlign: 'center' }}>
      <p>Access Denied</p>
      <p>{hint}</p>
      <small>
        Error message:
        <pre>{errorMessage}</pre>
      </small>
    </div>
  )
}

function App({ msalError, isAuthenticated, getAccessToken }: AuthComponentProps) {
  const [loginError, setLoginError] = useState<ILoginError>({})
  const [token, setToken] = useState<any>(null)
  const [particleRange, setParticleRange] = useState<Array<number>>([1.01, 1000])

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

  useEffect(() => {
    if (!msalError) return
    setLoginError({ ...msalError, errorCode: msalError.name })
  }, [msalError])

  if (token) {
    return (
      <AuthContext.Provider
        value={{ token: token.accessToken, email: token.account.username, name: token.account.name }}
      >
        <ParticleSizeContext.Provider
          value={{ from: particleRange[0], to: particleRange[1], setRange: setParticleRange }}
        >
          <Main />
        </ParticleSizeContext.Provider>
        <ToastContainer />
      </AuthContext.Provider>
    )
  }
  if (loginError?.errorCode === 'InteractionRequiredAuthError') {
    return (
      <AccessDenied
        errorMessage={loginError.errorMessage}
        hint={`Contact the applications owner to be granted access to this site (${process.env.REACT_APP_APPLICATION_OWNER})`}
      />
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
