import { UserStore } from '@app/stores'
import { createContext, PropsWithChildren, useCallback, useState } from 'react'

export type UserContextValue = {
  userStore: UserStore
}

export const UserContext = createContext({} as UserContextValue)

type Props = PropsWithChildren & {
  userStore: UserStore
}

export const UserContextProvider = ({ userStore, children }: Props) => {
  return <UserContext.Provider value={{ userStore }}>{children}</UserContext.Provider>
}
