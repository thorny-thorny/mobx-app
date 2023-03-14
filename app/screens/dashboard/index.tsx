import { AppButton } from '@app/components'
import { UserContext } from '@app/context'
import { UserNavigatorRoutes } from '@app/navigation/types'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useContext } from 'react'
import { View } from 'react-native'

type Props = NativeStackScreenProps<UserNavigatorRoutes, 'dashboard'>

export const DashboardScreen = (_props: Props) => {
  const { logOut } = useContext(UserContext)
  return (
    <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'center', padding: 8 }}>
      <AppButton title='Log out' onPress={logOut} />
    </View>
  )
}
