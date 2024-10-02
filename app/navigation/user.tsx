import { UserContextProvider } from '@app/context'
import { DashboardScreen } from '@app/screens'
import { UserStore } from '@app/stores'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { UserNavigatorRoutes } from './types'

type Props = {
  userStore: UserStore
}

const Stack = createNativeStackNavigator<UserNavigatorRoutes>()

export const UserNavigator = ({ userStore }: Props) => (
  <UserContextProvider userStore={userStore}>
    <Stack.Navigator>
      <Stack.Screen name='dashboard' component={DashboardScreen} />
    </Stack.Navigator>
  </UserContextProvider>
)
