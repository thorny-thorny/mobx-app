import AsyncStorage from '@react-native-async-storage/async-storage'

const write = async <Data>(key: string, value: Data) => {
  let json: string | null = null

  try {
    json = JSON.stringify(value)
  } catch (_err) {
    throw new Error('Failed to serialize data')
  }

  try {
    await AsyncStorage.setItem(key, json)
  } catch (_err) {
    throw new Error('Failed to write data')
  }
}

const read = async <Data>(key: string) => {
  let json: string | null = null

  try {
    json = await AsyncStorage.getItem(key)
  } catch (_err) {
    throw new Error('Failed to read data')
  }

  try {
    return json === null ? undefined : (JSON.parse(json) as Data)
  } catch (_err) {
    throw new Error('Failed to deserialize data')
  }
}

const remove = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key)
  } catch (_err) {
    throw new Error('Failed to delete data')
  }
}

export const JsonStorage = {
  write,
  read,
  remove,
}
