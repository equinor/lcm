import { useContext, useState } from 'react'

import Main from './Pages/Main'

import 'react-toastify/dist/ReactToastify.css'
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { AuthContext, type IAuthContext } from 'react-oauth2-code-pkce'
import { ToastContainer } from 'react-toastify'
import { reactPlugin } from './applicationInsight'
import { ParticleSizeContext } from './Context'

function App() {
  const [particleRange, setParticleRange] = useState<Array<number>>([1.01, 1000])
  const { tokenData }: IAuthContext = useContext(AuthContext)

  if (!tokenData) return null

  return (
    <>
      <ParticleSizeContext.Provider
        value={{
          from: particleRange[0],
          to: particleRange[1],
          setRange: setParticleRange,
        }}
      >
        <AppInsightsContext value={reactPlugin}>
          <Main />
        </AppInsightsContext>
      </ParticleSizeContext.Provider>
      <ToastContainer />
    </>
  )
}

export default App
