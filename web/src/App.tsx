import { useContext } from 'react'

import Main from './Pages/Main'

import 'react-toastify/dist/ReactToastify.css'
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { AuthContext, type IAuthContext } from 'react-oauth2-code-pkce'
import { ToastContainer } from 'react-toastify'
import { reactPlugin } from './applicationInsight'
import { ParticleSizeContextProvider } from './lib/contexts/particle-size'

function App() {
  const { tokenData }: IAuthContext = useContext(AuthContext)

  if (!tokenData) return null

  return (
    <>
      <ParticleSizeContextProvider>
        <AppInsightsContext value={reactPlugin}>
          <Main />
        </AppInsightsContext>
      </ParticleSizeContextProvider>
      <ToastContainer />
    </>
  )
}

export default App
