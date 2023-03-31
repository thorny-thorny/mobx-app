import { autorun, createAtom, intercept, Lambda, makeAutoObservable, onBecomeObserved, reaction } from 'mobx'
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
