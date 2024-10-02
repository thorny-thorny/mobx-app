import { getPlayersApi, getSportTypeApi } from '@app/api'
import { AppButton } from '@app/components'
import { RootContext } from '@app/context'
import { UserNavigatorRoutes } from '@app/navigation/types'
import { DataLoad, waitSeconds } from '@app/utils'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { observer } from 'mobx-react-lite'
import { useCallback, useContext, useState } from 'react'
import { View } from 'react-native'

type Props = NativeStackScreenProps<UserNavigatorRoutes, 'dashboard'>

export const DashboardScreen = observer((_props: Props) => {
  const { rootStore } = useContext(RootContext)
  const [{ reload, requestValue }] = useState(() =>
    DataLoad.combineLatest(DataLoad.ofPromise(getPlayersApi), DataLoad.ofPromise(getSportTypeApi))
      .map(([players, sport]) => ({
        players,
        sport,
      }))
      .asyncMap(async data => {
        await waitSeconds(2)
        return JSON.stringify(data)
      }),
  )

  const qwe = useCallback(() => {
    requestValue().then(console.log)
  }, [])

  return (
    <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'center', padding: 8 }}>
      <AppButton title='Qwe' onPress={qwe} />
      <AppButton title='reload' onPress={reload} />
      <AppButton title='Log out' onPress={rootStore.logOut} />
    </View>
  )
})
