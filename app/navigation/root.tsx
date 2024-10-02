import { BusyOverlay } from '@app/components'
import { useBusy } from '@app/utils'
import { OnboardingNavigator } from './onboarding'
import { useContext } from 'react'
import { RootContext } from '@app/context'
import { UserNavigator } from './user'
import { observer } from 'mobx-react-lite'

export const RootNavigator = observer(() => {
  const {
    rootStore: { userStore },
  } = useContext(RootContext)
  const isBusy = useBusy()
  return (
    <>
      {userStore === undefined && null}
      {userStore === null && <OnboardingNavigator />}
      {userStore !== undefined && userStore !== null && <UserNavigator userStore={userStore} />}
      {isBusy && <BusyOverlay />}
    </>
  )
})
