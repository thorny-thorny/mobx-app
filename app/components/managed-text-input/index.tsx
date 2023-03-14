import { useCallback, useMemo, useRef, useState } from 'react'
import { TextInput, TextInputProps } from 'react-native'

type HookParams = {
  initialValue?: string
  forcedInvalid?: boolean
  testValid?: (value: string) => boolean
  onSubmit?: () => void
}

export const useTextInput = ({ initialValue, forcedInvalid, testValid, onSubmit }: HookParams) => {
  const textInputRef = useRef<TextInput | null>(null)
  const [value, setValue] = useState(initialValue ?? '')
  const textRef = useRef<string>(value)

  const isValid = useMemo(() => (value ? testValid?.(value) ?? true : true), [value, testValid])
  const [highlightedInvalid, setHighlightedInvalid] = useState(!isValid)

  const ref = useCallback((obj: TextInput | null) => {
    if (!textInputRef.current) {
      textInputRef.current = obj
      textInputRef.current?.setNativeProps({ text: textRef.current })
    }
  }, [])

  const onChangeText = useCallback((text: string) => {
    textRef.current = text
    textInputRef.current?.setNativeProps({ text: textRef.current })
    setValue(text)
  }, [])

  const onSubmitEditing = useCallback(() => {
    onSubmit?.()
  }, [onSubmit])

  const onBlur = useCallback(() => {
    const text = textRef.current
    setHighlightedInvalid(!(text && testValid ? testValid(text) : true))
  }, [testValid])

  const focus = useCallback(() => {
    textInputRef.current?.focus()
  }, [])

  return {
    ref,
    value,
    isValid: !forcedInvalid && isValid,
    highlightedInvalid: Boolean(forcedInvalid) || highlightedInvalid,
    onChangeText,
    onSubmitEditing,
    onBlur,
    focus,
  }
}

type Props = Omit<TextInputProps, 'value' | 'ref' | 'onChangeText' | 'onSubmitEditing' | 'onBlur'> & {
  hook: ReturnType<typeof useTextInput>
}

export const ManagedTextInput = ({ hook, style, ...otherProps }: Props) => {
  return (
    <TextInput
      ref={hook.ref}
      onChangeText={hook.onChangeText}
      onSubmitEditing={hook.onSubmitEditing}
      onBlur={hook.onBlur}
      {...otherProps}
      style={[
        {
          height: 44,
          padding: 8,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: hook.highlightedInvalid ? 'red' : 'black',
        },
        style,
      ]}
    />
  )
}
