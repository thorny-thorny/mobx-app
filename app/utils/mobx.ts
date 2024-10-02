import {
  autorun,
  createAtom,
  IAtom,
  intercept,
  IObservableValue,
  IReactionDisposer,
  Lambda,
  makeAutoObservable,
  onBecomeObserved,
  reaction,
  runInAction,
} from 'mobx'
import { action, computed, makeObservable, observable } from 'mobx'
import { useEffect, useState } from 'react'

export class MobxEvent<T = undefined> {
  value: T | undefined = undefined

  constructor() {
    makeAutoObservable(this)
  }

  fire(value: T extends undefined ? void : T) {
    this.value = value as T
  }
}

export const watchEvent = <T>(event: MobxEvent<T>, onFire: (value: T) => void) => {
  return intercept(event, 'value', change => {
    onFire(change.newValue as T)
    return change
  })
}

export const useEvent = <T>(event: MobxEvent<T>, onFire: (value: T) => void) => {
  useEffect(() => {
    return watchEvent(event, onFire)
  }, [event, onFire])
}

export const useObservable = <T>(observable: () => T) => {
  const [state, setState] = useState(() => observable())
  useEffect(() => reaction(observable, () => setState(observable())), [])

  return state
}

export type MobxEnabled = () => void

export const makeMobxEnabled = (effects: () => Lambda) => {
  let dispose: Lambda | null = null

  const atom = createAtom(
    'Enabled Atom',
    () => {
      dispose = effects()
    },
    () => {
      dispose?.()
      dispose = null
    },
  )

  return () => {
    atom.reportObserved()
  }
}

export const useEnabled = (enabled: MobxEnabled) => {
  useEffect(() => autorun(() => enabled()), [enabled])
}

export enum LoadingStatusType {
  Loading = 'loading',
  Error = 'error',
  Loaded = 'loaded',
}

export type LoadingStatusLoading = {
  type: LoadingStatusType.Loading
}

export type LoadingStatusError = {
  type: LoadingStatusType.Error
  error: any
}

export type LoadingStatusLoaded<T> = {
  type: LoadingStatusType.Loaded
  data: T
}

export type LoadingStatus<T> = LoadingStatusLoading | LoadingStatusError | LoadingStatusLoaded<T>

enum DataLoadConfigType {
  Promise = 'promise',
  Combine = 'combine',
  Value = 'value',
  Map = 'map',
  AsyncMap = 'async-map',
}

type DataLoadConfigPromise<T> = {
  type: DataLoadConfigType.Promise
  getData: () => Promise<T>
}

type DataLoadConfigCombine = {
  type: DataLoadConfigType.Combine
  sources: DataLoad<any>[]
}

type DataLoadConfigValue<T> = {
  type: DataLoadConfigType.Value
  value: IObservableValue<T>
}

type DataLoadConfigMap<T, V> = {
  type: DataLoadConfigType.Map
  source: DataLoad<V>
  transform: (value: V) => T
}

type DataLoadConfigAsyncMap<T, V> = {
  type: DataLoadConfigType.AsyncMap
  source: DataLoad<V>
  transform: (value: V) => Promise<T>
}

type DataLoadConfig<T, V = undefined> =
  | DataLoadConfigPromise<T>
  | DataLoadConfigCombine
  | DataLoadConfigValue<T>
  | DataLoadConfigMap<T, V>
  | DataLoadConfigAsyncMap<T, V>

export class DataLoad<T> {
  private _promiseStatus: LoadingStatus<T> = { type: LoadingStatusType.Loading }
  private readonly statusAtom: IAtom
  private cancelLoading: (() => void) | null = null
  private autorunDisposer: IReactionDisposer | null = null

  constructor(private readonly config: DataLoadConfig<T>) {
    this.statusAtom = createAtom('status', this.onBecomeObserved, this.onBecomeUnobserved)
    observable.box()
    makeObservable(this, {
      status: config.type === DataLoadConfigType.Promise || config.type === DataLoadConfigType.AsyncMap ? false : computed,
      isLoading: computed,
      error: computed,
      data: computed,
    })
  }

  static ofPromise = <T>(getData: () => Promise<T>) => {
    return new DataLoad({ type: DataLoadConfigType.Promise, getData })
  }

  static ofValue = <T>(value: IObservableValue<T>) => {
    return new DataLoad({ type: DataLoadConfigType.Value, value })
  }

  static combineLatest<A, B>(s1: DataLoad<A>, s2: DataLoad<B>): DataLoad<[A, B]>

  static combineLatest<T>(...sources: DataLoad<T>[]): DataLoad<T[]>

  static combineLatest(...sources: DataLoad<any>[]) {
    return new DataLoad<any>({
      type: DataLoadConfigType.Combine,
      sources,
    })
  }

  map = <V>(transform: (value: T) => V) => {
    return new DataLoad<V>({ type: DataLoadConfigType.Map, source: this, transform } as DataLoadConfigMap<V, T>)
  }

  asyncMap = <V>(transform: (value: T) => Promise<V>) => {
    return new DataLoad<V>({ type: DataLoadConfigType.AsyncMap, source: this, transform } as DataLoadConfigAsyncMap<V, T>)
  }

  requestValue = () => {
    return new Promise<T>((resolve, reject) => {
      const disposer = autorun(() => {
        const status = this.status
        if (status.type === LoadingStatusType.Loaded) {
          disposer()
          resolve(status.data)
        } else if (status.type === LoadingStatusType.Error) {
          disposer()
          reject(status.error)
        }
      })
    })
  }

  private changeStatus = (status: LoadingStatus<T>) => {
    if (this._promiseStatus.type !== LoadingStatusType.Loading || status.type !== LoadingStatusType.Loading) {
      this._promiseStatus = status
      this.statusAtom.reportChanged()
    }
  }

  private cancel = () => {
    if (this.cancelLoading) {
      this.cancelLoading()
      this.cancelLoading = null
    }
  }

  private onBecomeObserved = () => {
    if (this.config.type === DataLoadConfigType.Promise) {
      this.invalidate()
    } else if (this.config.type === DataLoadConfigType.AsyncMap) {
      const asyncMapConfig = this.config
      this.autorunDisposer = autorun(() => this.onSourceUpdate(asyncMapConfig.source.status))
    }
  }

  private onBecomeUnobserved = () => {
    if (this.config.type === DataLoadConfigType.Promise) {
      this.cancel()
      this.changeStatus({ type: LoadingStatusType.Loading })
    } else if (this.config.type === DataLoadConfigType.AsyncMap && this.autorunDisposer) {
      this.autorunDisposer()
      this.autorunDisposer = null
    }
  }

  private onSourceUpdate = (value: LoadingStatus<any>) => {
    if (value.type === LoadingStatusType.Error || value.type === LoadingStatusType.Loading) {
      this.cancel()
      this.changeStatus(value)
    } else {
      this.invalidate()
    }
  }

  invalidate = () => {
    this.cancel()

    let isValid = true
    this.cancelLoading = () => {
      isValid = false
    }

    this.changeStatus({ type: LoadingStatusType.Loading })

    let promise: Promise<T>
    if (this.config.type === DataLoadConfigType.Promise) {
      promise = this.config.getData()
    } else if (this.config.type === DataLoadConfigType.AsyncMap) {
      const sourceStatus = this.config.source.status
      if (sourceStatus.type !== LoadingStatusType.Loaded) {
        throw new Error('Source is not loaded')
      }

      promise = this.config.transform(sourceStatus.data)
    } else {
      throw new Error("Can't call invalidate of this object")
    }

    promise
      .then(data => {
        if (isValid) {
          this.changeStatus({ type: LoadingStatusType.Loaded, data })
        }
      })
      .catch(error => {
        if (isValid) {
          this.changeStatus({ type: LoadingStatusType.Error, error })
        }
      })
  }

  reload = () => {
    if (this.config.type === DataLoadConfigType.Promise) {
      this.invalidate()
    } else if (this.config.type === DataLoadConfigType.Combine) {
      this.config.sources.forEach(source => {
        if (source.status.type === LoadingStatusType.Error) {
          source.reload()
        }
      })
    } else if (this.config.type === DataLoadConfigType.Map) {
      this.config.source.reload()
    } else if (this.config.type === DataLoadConfigType.AsyncMap) {
      if (this.config.source.status.type === LoadingStatusType.Error) {
        this.config.source.reload()
      } else if (this.status.type === LoadingStatusType.Loaded) {
        this.invalidate()
      }
    }
  }

  get status(): LoadingStatus<T> {
    if (this.config.type === DataLoadConfigType.Promise || this.config.type === DataLoadConfigType.AsyncMap) {
      this.statusAtom.reportObserved()
      return this._promiseStatus
    } else if (this.config.type === DataLoadConfigType.Combine) {
      const statuses = this.config.sources.map(source => source.status)
      const errorStatus = statuses.find(status => status.type === LoadingStatusType.Error)
      if (errorStatus) {
        return errorStatus
      }

      const loadingStatus = statuses.find(status => status.type === LoadingStatusType.Loading)
      if (loadingStatus) {
        return loadingStatus
      }

      return { type: LoadingStatusType.Loaded, data: statuses.map(status => (status as LoadingStatusLoaded<any>).data) } as LoadingStatus<T>
    } else if (this.config.type === DataLoadConfigType.Value) {
      return { type: LoadingStatusType.Loaded, data: this.config.value.get() } as LoadingStatus<T>
    } else if (this.config.type === DataLoadConfigType.Map) {
      const sourceStatus = this.config.source.status
      if (sourceStatus.type === LoadingStatusType.Loaded) {
        return { type: LoadingStatusType.Loaded, data: this.config.transform(sourceStatus.data) } as LoadingStatus<T>
      } else {
        return sourceStatus
      }
    }

    throw new Error('Types fix')
  }

  get isLoading() {
    return this.status.type === LoadingStatusType.Loading
  }

  get error() {
    return this.status.type === LoadingStatusType.Error ? this.status.error : undefined
  }

  get data() {
    return this.status.type === LoadingStatusType.Loaded ? this.status.data : undefined
  }
}
