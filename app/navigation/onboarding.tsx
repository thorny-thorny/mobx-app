import { LoginScreen, OnboardingScreen } from '@app/screens'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { OnboardingNavigatorRoutes } from './types'

const Stack = createNativeStackNavigator<OnboardingNavigatorRoutes>()

export const OnboardingNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name='onboarding' component={OnboardingScreen} />
    <Stack.Screen name='login' component={LoginScreen} />
  </Stack.Navigator>
)
