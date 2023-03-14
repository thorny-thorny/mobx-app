import { DashboardScreen } from '@app/screens'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { UserNavigatorRoutes } from './types'

const Stack = createNativeStackNavigator<UserNavigatorRoutes>()

export const UserNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name='dashboard' component={DashboardScreen} />
  </Stack.Navigator>
)
