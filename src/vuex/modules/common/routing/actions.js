import {
  SET_ROUTE_BEFORE_REDIRECT
} from './mutation-types'

export const setRouteBeforeRedirect = (store, routeName) => {
  store.dispatch(SET_ROUTE_BEFORE_REDIRECT, routeName)
}
