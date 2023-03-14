import { AppButton } from '@app/components'
import { OnboardingNavigatorRoutes } from '@app/navigation/types'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from 'react-native'

type Props = NativeStackScreenProps<OnboardingNavigatorRoutes, 'onboarding'>

export const OnboardingScreen = (props: Props) => {
  return (
    <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'center', padding: 8 }}>
      <AppButton title='Log in' onPress={() => props.navigation.navigate('login')} />
    </View>
  )
}
