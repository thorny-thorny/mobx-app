import { useCallback, useEffect, useState } from 'react'

type BusyListener = (isBusy: boolean) => void

const busy: { [name: string]: boolean } = {}
const listeners = new Set<BusyListener>()

const getIsAnyBusy = () => {
  let isAnyBusy = false
  for (const busyName in busy) {
    isAnyBusy = isAnyBusy || busy[busyName]
  }
  return isAnyBusy
}

export const useSetBusy = (name: string) => {
  const setBusy = useCallback(
    (isBusy: boolean) => {
      busy[name] = isBusy
      const isAnyBusy = getIsAnyBusy()
      listeners.forEach(listener => listener(isAnyBusy))
    },
    [name],
  )

  useEffect(() => {
    return () => setBusy(false)
  }, [setBusy])

  return setBusy
}

export const useBusy = () => {
  const [isBusy, setIsBusy] = useState(() => getIsAnyBusy())

  useEffect(() => {
    listeners.add(setIsBusy)
    return () => {
      listeners.delete(setIsBusy)
    }
  }, [])

  return isBusy
}
