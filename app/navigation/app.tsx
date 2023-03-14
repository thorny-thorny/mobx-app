import { UserContextProvider } from '@app/context'
import { NavigationContainer } from '@react-navigation/native'
import { RootNavigator } from './root'

export const App = () => {
  return (
    <NavigationContainer>
      <UserContextProvider>
        <RootNavigator />
      </UserContextProvider>
    </NavigationContainer>
  )
}
