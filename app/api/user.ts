import { waitSeconds } from '@app/utils'

export const loginApi = async (email: string, password: string) => {
  await waitSeconds(3)
  if (email === 'q@q.qq') {
    return true
  } else if (email === 'w@w.ww') {
    throw new Error('Failed to load data')
  } else {
    return false
  }
}
