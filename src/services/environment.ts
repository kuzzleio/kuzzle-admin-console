import store from '../vuex/store'
import * as authTypes from '../vuex/modules/auth/mutation-types'
import * as kuzzleTypes from '../vuex/modules/common/kuzzle/mutation-types'

export const DEFAULT_COLOR = '#002835'

export const deleteEnvironment = id => {
  if (store.getters.currentEnvironmentId === id) {
    store.dispatch(authTypes.DO_LOGOUT)
  }

  store.dispatch(kuzzleTypes.DELETE_ENVIRONMENT, id)
}
