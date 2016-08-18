import {
  SET_BASIC_FILTER
} from './mutation-types'

export const setBasicFilter = (store, basicFilter) => {
  store.dispatch(SET_BASIC_FILTER, basicFilter)
}
