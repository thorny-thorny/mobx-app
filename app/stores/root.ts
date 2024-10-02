import { loginApi } from '@app/api'
import { StorageService } from '@app/services'
import { makeAutoObservable, runInAction } from 'mobx'
import { UserStore } from './user'

export class RootStore {
  readonly storageService = new StorageService()
  private _userStore: UserStore | null | undefined = undefined

  constructor() {
    makeAutoObservable(this, { storageService: false })
    this.initialize()
  }

  initialize = async () => {
    const isLoggedIn = await this.storageService.loggedIn.get()
    runInAction(() => {
      if (isLoggedIn) {
        this._userStore = new UserStore()
      } else {
        this._userStore = null
      }
    })
  }

  get userStore() {
    return this._userStore
  }

  logIn = async (email: string, password: string) => {
    const credentialsAreCorrect = await loginApi(email, password)
    if (credentialsAreCorrect) {
      await this.storageService.loggedIn.set(true)
      runInAction(() => {
        this._userStore = new UserStore()
      })
      return true
    } else {
      return false
    }
  }

  logOut = async () => {
    await this.storageService.loggedIn.set(false)
    runInAction(() => {
      this._userStore = null
    })
  }
}
