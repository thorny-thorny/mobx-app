import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Alert, Keyboard, ScrollView, Text, View } from 'react-native'
import { AppButton, ManagedTextInput, TextInputControl } from '@app/components'
import {
  isValidEmail,
  makeMobxEnabled,
  MobxEnabled,
  MobxEvent,
  useEnabled,
  useEvent,
  useObservable,
  useSetBusy,
  watchEvent,
} from '@app/utils'
import { UserContext, UserContextValue } from '@app/context'
import { autorun, makeAutoObservable, reaction, runInAction } from 'mobx'

class LoginControl {
  emailControl: TextInputControl
  passwordControl: TextInputControl
  dismissKeyboard = new MobxEvent()
  showAlert = new MobxEvent<string>()
  isBusy = false
  wrongCredentials = false
  enabled: MobxEnabled

  constructor(private readonly userContext: UserContextValue) {
    this.emailControl = new TextInputControl({ testValid: isValidEmail })
    this.passwordControl = new TextInputControl({})

    this.enabled = makeMobxEnabled(() => {
      const emailSubmitDispose = watchEvent(this.emailControl.submitEditingEvent, () => this.passwordControl.focus())
      const passwordSubmitDispose = watchEvent(this.passwordControl.submitEditingEvent, () => this.submit())
      const resetForcedIvalidDispose = reaction(
        () => [this.emailControl.value, this.passwordControl.value],
        () => {
          this.emailControl.forcedInvalid = false
          this.passwordControl.forcedInvalid = false
          this.wrongCredentials = false
        },
      )

      return () => {
        emailSubmitDispose()
        passwordSubmitDispose()
        resetForcedIvalidDispose()
      }
    })

    makeAutoObservable(this)
  }

  get cantSubmit() {
    const emailIsEmptyOrInvalid = !this.emailControl.value || !this.emailControl.isValid
    const passwordIsEmptyOrInvalid = !this.passwordControl.value || !this.passwordControl.isValid
    return emailIsEmptyOrInvalid || passwordIsEmptyOrInvalid
  }

  async submit() {
    if (this.cantSubmit) {
      return
    }

    this.dismissKeyboard.fire()

    this.isBusy = true

    try {
      const credentialsAreCorrect = await this.userContext.logIn(this.emailControl.value, this.passwordControl.value)
      if (!credentialsAreCorrect) {
        runInAction(() => {
          this.emailControl.forcedInvalid = true
          this.passwordControl.forcedInvalid = true
          this.wrongCredentials = true
        })
      }
    } catch (_) {
      this.showAlert.fire('Filed to load data')
    }

    runInAction(() => {
      this.isBusy = false
    })
  }

  onSubmitPress() {
    this.submit()
  }
}

export const LoginScreen = () => {
  const userContext = useContext(UserContext)
  const setBusy = useSetBusy('login')
  const [control] = useState(() => new LoginControl(userContext))
  const cantSubmit = useObservable(() => control.cantSubmit)
  const wrongCredentials = useObservable(() => control.wrongCredentials)
  useEvent(control.dismissKeyboard, () => Keyboard.dismiss())
  useEvent(control.showAlert, message => Alert.alert('', message))
  useEffect(() => autorun(() => setBusy(control.isBusy)), [])
  useEnabled(control.enabled)

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps='handled' style={{ flex: 1 }}>
        <ManagedTextInput
          control={control.emailControl}
          placeholder='E-mail (try q@q.qq or w@w.ww)'
          returnKeyType='next'
          keyboardType='email-address'
          autoCapitalize='none'
          style={{ margin: 8 }}
        />
        <ManagedTextInput
          control={control.passwordControl}
          placeholder='Password'
          secureTextEntry={true}
          returnKeyType='go'
          style={{ margin: 8 }}
        />
        <AppButton title='Log in' disabled={cantSubmit} onPress={() => control.onSubmitPress()} style={{ margin: 8 }} />
        {wrongCredentials && <Text style={{ margin: 8, color: 'red', textAlign: 'center' }}>Wrong email or password</Text>}
      </ScrollView>
    </View>
  )
}
