import { BusyOverlay } from '@app/components'
import { useBusy } from '@app/utils'
import { OnboardingNavigator } from './onboarding'
import { useContext } from 'react'
import { UserContext } from '@app/context'
import { UserNavigator } from './user'

export const RootNavigator = () => {
  const { loggedIn } = useContext(UserContext)
  const isBusy = useBusy()
  return (
    <>
      {loggedIn ? <UserNavigator /> : <OnboardingNavigator />}
      {isBusy && <BusyOverlay />}
    </>
  )
}
