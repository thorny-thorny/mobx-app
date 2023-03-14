import { ActivityIndicator, StyleSheet, View } from 'react-native'

export const BusyOverlay = () => {
  return (
    <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.666 }]}>
      <ActivityIndicator size='large' color='white' />
    </View>
  )
}
