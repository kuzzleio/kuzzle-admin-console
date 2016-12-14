import * as types from './mutation-types'
import { LAST_CONNECTED, persistEnvironments } from '../../../../services/environment'
import { environments } from './getters'

export default {
  [types.SET_CONNECTION] ({commit}, id) {
    commit(types.CONNECT_TO_ENVIRONMENT, id)
    // eslint-disable-next-line no-undef
    localStorage.setItem(LAST_CONNECTED, id)
  },
  [types.ADD_ENVIRONMENT] ({commit, state}, payload) {
    try {
      commit(types.ADD_ENVIRONMENT, {id: payload.id, environment: payload.environment})
    } catch (e) {
      console.warn(`Unable to add ${payload.id}. Got the following error
      ${e.message}`)
    }

    if (payload.persist) {
      persistEnvironments(environments(state))
    }
  },
  [types.DELETE_ENVIRONMENT] ({commit, state}, id) {
    commit(types.DELETE_ENVIRONMENT, id)
    persistEnvironments(environments(state))
  },
  [types.UPDATE_ENVIRONMENT] ({commit, state}, payload) {
    commit(types.UPDATE_ENVIRONMENT, {id: payload.id, environment: payload.environment})
    persistEnvironments(state.environments)
  }
}
