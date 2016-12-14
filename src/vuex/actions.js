import { RESET } from './mutation-types'

export const reset = (store) => {
  store.commit(RESET)
}
