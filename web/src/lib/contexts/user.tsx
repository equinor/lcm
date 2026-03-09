import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'

type User = {
  name: string
  email: string
  oid: string
}

type UserContextType = {
  user: User | undefined
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    axios
      .get<User>('/api/me')
      .then((res) => setUser(res.data))
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          window.location.href = '/oauth2/sign_in'
          return
        }
        console.error('Failed to load current user:', error)
      })
  }, [])

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
}

export function useUserContext(): UserContextType {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider')
  }
  return context
}
