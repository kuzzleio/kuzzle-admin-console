import store from '../vuex/store'
import * as authTypes from '../vuex/modules/auth/mutation-types'
import * as kuzzleTypes from '../vuex/modules/common/kuzzle/mutation-types'

export const LAST_CONNECTED = 'lastConnectedEnv'
export const DEFAULT_COLOR = '#002835'

export const loadLastConnectedEnvId = () => {
  // eslint-disable-next-line no-undef
  return localStorage.getItem(LAST_CONNECTED)
}

export const deleteEnvironment = (id) => {
  if (store.getters.currentEnvironmentId === id) {
    store.dispatch(authTypes.DO_LOGOUT)
  }

  store.dispatch(kuzzleTypes.DELETE_ENVIRONMENT, id)
}

export const setTokenToCurrentEnvironment = (token) => {
  store.dispatch(kuzzleTypes.UPDATE_ENVIRONMENT, {
    id: store.getters.currentEnvironmentId,
    environment: {
      ...store.getters.currentEnvironment,
      token: token
    }
  })
  return store.getters.currentEnvironment
}
