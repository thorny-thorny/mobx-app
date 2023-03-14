import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Alert, Keyboard, ScrollView, Text, View } from 'react-native'
import { AppButton, ManagedTextInput, useTextInput } from '@app/components'
import { isValidEmail, useSetBusy } from '@app/utils'
import { UserContext } from '@app/context'

const useLoginHook = () => {
  const focusPasswordRef = useRef<(() => void) | null>(null)
  const focusPassword = useCallback(() => focusPasswordRef.current?.(), [])
  const submitRef = useRef<(() => void) | null>(null)
  const submit = useCallback(() => submitRef.current?.(), [])

  const [wrongCredentials, setWrongCredentials] = useState(false)
  const email = useTextInput({ testValid: isValidEmail, forcedInvalid: wrongCredentials, onSubmit: focusPassword })
  const password = useTextInput({ forcedInvalid: wrongCredentials, onSubmit: submit })
  const setBusy = useSetBusy('login')
  const { logIn } = useContext(UserContext)

  if (!focusPasswordRef.current) {
    focusPasswordRef.current = password.focus
  }

  const emailIsEmptyOrInvalid = !email.value || !email.isValid
  const passwordIsEmptyOrInvalid = !password.value || !password.isValid
  const cantSubmit = emailIsEmptyOrInvalid || passwordIsEmptyOrInvalid

  useEffect(() => setWrongCredentials(false), [email.value, password.value])

  submitRef.current = async () => {
    if (cantSubmit) {
      return
    }

    Keyboard.dismiss()

    setBusy(true)

    try {
      const credentialsAreCorrect = await logIn(email.value, password.value)
      if (!credentialsAreCorrect) {
        setWrongCredentials(true)
      }
    } catch (_) {
      Alert.alert('', 'Failed to load data')
    }

    setBusy(false)
  }

  return { email, password, cantSubmit, wrongCredentials, onSubmitPress: () => submitRef.current?.() }
}

export const LoginScreen = () => {
  const { email, password, cantSubmit, wrongCredentials, onSubmitPress } = useLoginHook()

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps='handled' style={{ flex: 1 }}>
        <ManagedTextInput
          hook={email}
          placeholder='E-mail (try q@q.qq or w@w.ww)'
          returnKeyType='next'
          keyboardType='email-address'
          autoCapitalize='none'
          style={{ margin: 8 }}
        />
        <ManagedTextInput hook={password} placeholder='Password' secureTextEntry={true} returnKeyType='go' style={{ margin: 8 }} />
        <AppButton title='Log in' disabled={cantSubmit} onPress={onSubmitPress} style={{ margin: 8 }} />
        {wrongCredentials && <Text style={{ margin: 8, color: 'red', textAlign: 'center' }}>Wrong email or password</Text>}
      </ScrollView>
    </View>
  )
}
