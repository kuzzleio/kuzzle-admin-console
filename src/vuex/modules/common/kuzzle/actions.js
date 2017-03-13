import * as types from './mutation-types'
import * as authTypes from '../../auth/mutation-types'
import { LAST_CONNECTED, persistEnvironments } from '../../../../services/environment'
import { waitForConnected, connectToEnvironment } from '../../../../services/kuzzleWrapper'

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
      persistEnvironments(state.environments)
    }
  },
  [types.DELETE_ENVIRONMENT] ({commit, state}, id) {
    commit(types.DELETE_ENVIRONMENT, id)
    persistEnvironments(state.environments)
  },
  [types.UPDATE_ENVIRONMENT] ({commit, state}, payload) {
    commit(types.UPDATE_ENVIRONMENT, {id: payload.id, environment: payload.environment})
    persistEnvironments(state.environments)
  },
  [types.SWITCH_ENVIRONMENT] ({commit, state, dispatch}, id) {
    if (!id) {
      throw new Error(`cannot switch to ${id} environment`)
    }

    let environment = state.environments[id]
    if (!environment) {
      throw new Error(`Id ${id} does not match any environment`)
    }

    commit(types.RESET)

    connectToEnvironment(environment)

    return waitForConnected(5000)
      .then(() => {
        dispatch(types.SET_CONNECTION, id)

        return dispatch(authTypes.LOGIN_BY_TOKEN, {token: environment.token})
          .then(user => {
            if (!user.id) {
              return dispatch(authTypes.CHECK_FIRST_ADMIN)
            }

            return
          })
      })
  }
}
