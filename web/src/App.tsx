import { useContext, useState } from 'react'

import Main from './Pages/Main'

import 'react-toastify/dist/ReactToastify.css'
import { AuthContext, type IAuthContext } from 'react-oauth2-code-pkce'
import { ToastContainer } from 'react-toastify'
import { ParticleSizeContext } from './Context'

function App() {
  const [particleRange, setParticleRange] = useState<Array<number>>([1.01, 1000])
  const { tokenData }: IAuthContext = useContext(AuthContext)

  if (!tokenData) return <></>
  return (
    <>
      <ParticleSizeContext.Provider
        value={{
          from: particleRange[0],
          to: particleRange[1],
          setRange: setParticleRange,
        }}
      >
        <Main />
      </ParticleSizeContext.Provider>
      <ToastContainer />
    </>
  )
}

// @ts-ignore
export default App
