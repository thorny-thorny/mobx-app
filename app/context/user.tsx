import { loginApi } from '@app/api'
import { createContext, PropsWithChildren, useCallback, useState } from 'react'

export type UserContextValue = {
  loggedIn: boolean
  logIn: (email: string, password: string) => Promise<boolean>
  logOut: () => void
}

export const UserContext = createContext({} as UserContextValue)

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [loggedIn, setLoggedIn] = useState(false)

  const logIn = useCallback(async (email: string, password: string) => {
    const credentialsAreCorrect = await loginApi(email, password)
    if (credentialsAreCorrect) {
      setLoggedIn(true)
      return true
    } else {
      return false
    }
  }, [])

  const logOut = useCallback(() => {
    setLoggedIn(false)
  }, [])

  return <UserContext.Provider value={{ loggedIn, logIn, logOut }}>{children}</UserContext.Provider>
}
