import { PropsWithChildren } from 'react'
import { StyleProp, Text, TouchableOpacity, ViewStyle } from 'react-native'

type Props = {
  title: string
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  onPress: () => void
}

export const AppButton = (props: Props) => {
  return (
    <TouchableOpacity
      disabled={props.disabled}
      onPress={props.onPress}
      style={[
        { height: 44, justifyContent: 'center', backgroundColor: 'coral', borderRadius: 5 },
        props.disabled && { opacity: 0.5 },
        props.style,
      ]}
    >
      <Text style={{ color: 'white', textAlign: 'center' }}>{props.title}</Text>
    </TouchableOpacity>
  )
}
