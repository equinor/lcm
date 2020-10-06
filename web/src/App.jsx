import React from 'react'

import './App.css'
import { v4 as uuidv4 } from 'uuid'
import Main from './Pages/Main'
import './Components/icons'
import { AuthContext, authProvider } from './Auth/Auth'
// @ts-ignore
import { AuthenticationState, AzureAD } from 'react-aad-msal'
import { APIConfiguration } from "./Api"

const defaultState = new Map()

const sackCombination = {
  id: uuidv4(),
  name: 'Sack combination 1',
  sacks: true,
  values: new Map(),
  cumulative: null,
}
defaultState.set(sackCombination.id, sackCombination)

const manualCombination = {
  id: uuidv4(),
  name: 'Manual combination 1',
  sacks: false,
  values: new Map(),
  cumulative: null,
}

defaultState.set(manualCombination.id, manualCombination)

function App() {
  return (
    <div>
      <AzureAD provider={authProvider} forceLogin={true}>
        {({ login, logout, authenticationState, error, accountInfo }) => {
          if (authenticationState === AuthenticationState.Unauthenticated) login()
          if (error) {
            return <span>An error occured during authentication, please try again!</span>
          }

          return (
            <AuthContext.Provider value={accountInfo}>
              <Main defaultState={defaultState} />
            </AuthContext.Provider>
          )
        }}
      </AzureAD>
    </div>
  )
}

export default App
