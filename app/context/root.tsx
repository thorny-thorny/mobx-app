import { RootStore } from '@app/stores'
import { createContext, PropsWithChildren, useState } from 'react'

export type RootContextValue = {
  rootStore: RootStore
}

export const RootContext = createContext({} as RootContextValue)

export const RootContextProvider = ({ children }: PropsWithChildren) => {
  const [rootStore] = useState(() => new RootStore())

  return <RootContext.Provider value={{ rootStore }}>{children}</RootContext.Provider>
}
