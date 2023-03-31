import { MobxEvent, useEvent } from '@app/utils'
import { makeAutoObservable, reaction } from 'mobx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TextInput, TextInputProps } from 'react-native'

type ControlParams = {
  initialValue?: string
  testValid?: (value: string) => boolean
}

export class TextInputControl {
  value: string
  private testValid: ControlParams['testValid']
  private shadowedHighlightedInvalid: boolean
  forcedInvalid?: boolean = undefined

  focusEvent = new MobxEvent()
  submitEditingEvent = new MobxEvent()

  constructor(params: ControlParams) {
    this.value = params.initialValue ?? ''
    this.testValid = params.testValid
    this.shadowedHighlightedInvalid = !this.shadowedIsValid
    makeAutoObservable(this)
  }

  private get shadowedIsValid() {
    return this.value && this.testValid ? this.testValid(this.value) : true
  }

  get isValid() {
    return !this.forcedInvalid && this.shadowedIsValid
  }

  get highlightedInvalid() {
    return Boolean(this.forcedInvalid) || this.shadowedHighlightedInvalid
  }

  onChangeText(value: string) {
    this.value = value
  }

  onBlur() {
    this.shadowedHighlightedInvalid = !this.shadowedIsValid
  }

  onSubmitEditing() {
    this.submitEditingEvent.fire()
  }

  focus() {
    this.focusEvent.fire()
  }
}

type Props = Omit<TextInputProps, 'value' | 'ref' | 'onChangeText' | 'onSubmitEditing' | 'onBlur'> & {
  control: TextInputControl
}

export const ManagedTextInput = ({ control, style, ...otherProps }: Props) => {
  const textInputRef = useRef<TextInput | null>(null)
  const ref = useCallback(
    (obj: TextInput | null) => {
      if (!textInputRef.current) {
        textInputRef.current = obj
        textInputRef.current?.setNativeProps({ text: control.value })
      }
    },
    [control],
  )

  useEvent(control.focusEvent, () => textInputRef.current?.focus())

  const [highlightedInvalid, setHighlightedInvalid] = useState(control.highlightedInvalid)

  useEffect(() => {
    const valueDisposer = reaction(
      () => control.value,
      value => textInputRef.current?.setNativeProps({ text: value }),
    )

    const highlightedInvalidDisposer = reaction(() => control.highlightedInvalid, setHighlightedInvalid)

    return () => {
      valueDisposer()
      highlightedInvalidDisposer()
    }
  }, [control])

  return (
    <TextInput
      ref={ref}
      onChangeText={text => control.onChangeText(text)}
      onSubmitEditing={() => control.onSubmitEditing()}
      onBlur={() => control.onBlur()}
      {...otherProps}
      style={[
        {
          height: 44,
          padding: 8,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: highlightedInvalid ? 'red' : 'black',
        },
        style,
      ]}
    />
  )
}
