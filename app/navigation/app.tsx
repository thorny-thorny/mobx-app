import { RootContextProvider } from '@app/context'
import { NavigationContainer } from '@react-navigation/native'
import { RootNavigator } from './root'

export const App = () => {
  return (
    <NavigationContainer>
      <RootContextProvider>
        <RootNavigator />
      </RootContextProvider>
    </NavigationContainer>
  )
}
