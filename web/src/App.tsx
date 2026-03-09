import { Home } from './Pages/Home'

import 'react-toastify/dist/ReactToastify.css'
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { ToastContainer } from 'react-toastify'
import { reactPlugin } from './lib/applicationInsights'
import { ParticleSizeContextProvider } from './lib/contexts/particle-size'
import { UserContextProvider } from './lib/contexts/user'

export function App() {
  return (
    <UserContextProvider>
      <ParticleSizeContextProvider>
        <AppInsightsContext value={reactPlugin}>
          <Home />
        </AppInsightsContext>
      </ParticleSizeContextProvider>
      <ToastContainer />
    </UserContextProvider>
  )
}
