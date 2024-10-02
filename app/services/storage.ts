import { JsonStorage } from '@app/support'
import AsyncStorage from '@react-native-async-storage/async-storage'

const storageItem = <Data>(key: string) => {
  return {
    get: () => JsonStorage.read<Data>(key),
    set: (value: Data) => JsonStorage.write<Data>(key, value),
    remove: () => JsonStorage.remove(key),
  }
}

export class StorageService {
  constructor() {}

  loggedIn = storageItem<boolean>('logged-in')
}
