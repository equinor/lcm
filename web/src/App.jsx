import React from 'react'

import './App.css'
import Main from './Pages/Main'
import './Components/icons'
import { AuthContext, authProvider } from './Auth/Auth'
// @ts-ignore
import { AuthenticationState, AzureAD } from 'react-aad-msal'
import { APIConfiguration } from "./Api"



function App() {
  return (
    <div>
      <AzureAD provider={authProvider}>
        {({ login, logout, authenticationState, error, accountInfo }) => {
          if (authenticationState === AuthenticationState.InProgress) return <h1>Logging in...</h1>
          if (authenticationState === AuthenticationState.Unauthenticated) login()
          if (error) {
            return <span>An error occured during authentication, please try again!</span>
          }
          return (
            <AuthContext.Provider value={accountInfo}>
              <Main />
            </AuthContext.Provider>
          )
        }}
      </AzureAD>
    </div>
  )
}

export default App
