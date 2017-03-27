import * as types from './mutation-types'
import * as authTypes from '../../auth/mutation-types'
import { LAST_CONNECTED } from '../../../../services/environment'
import { waitForConnected, connectToEnvironment } from '../../../../services/kuzzleWrapper'

const ENVIRONMENT_ITEM_NAME = 'environments'

export default {
  [types.SET_CONNECTION] ({commit}, id) {
    commit(types.CONNECT_TO_ENVIRONMENT, id)
    localStorage.setItem(LAST_CONNECTED, id)
  },
  [types.CREATE_ENVIRONMENT] ({commit, state, dispatch}, payload) {
    try {
      commit(types.CREATE_ENVIRONMENT, payload)
    } catch (e) {
      console.warn(`Unable to add ${payload.id}. Got the following error
      ${e.message}`)
    }

    localStorage.setItem(ENVIRONMENT_ITEM_NAME, JSON.stringify(state.environments))

    dispatch(types.SWITCH_ENVIRONMENT, payload.name)
  },
  [types.DELETE_ENVIRONMENT] ({commit, state}, id) {
    commit(types.DELETE_ENVIRONMENT, id)
    localStorage.setItem(ENVIRONMENT_ITEM_NAME, JSON.stringify(state.environments))
  },
  [types.UPDATE_ENVIRONMENT] ({commit, state}, payload) {
    commit(types.UPDATE_ENVIRONMENT, {id: payload.id, environment: payload.environment})
    localStorage.setItem(ENVIRONMENT_ITEM_NAME, JSON.stringify(state.environments))
  },
  [types.SWITCH_ENVIRONMENT] ({commit, state, dispatch}, id) {
    if (!id) {
      return Promise.resolve()
    }

    let environment = state.environments[id]
    if (!environment) {
      throw new Error(`Id ${id} does not match any environment`)
    }

    commit(types.RESET)

    connectToEnvironment(environment)
    dispatch(types.SET_CONNECTION, id)

    return waitForConnected(5000)
      .then(() => {
        return dispatch(authTypes.LOGIN_BY_TOKEN, {token: environment.token})
          .then(user => {
            if (!user.id) {
              return dispatch(authTypes.CHECK_FIRST_ADMIN)
            }

            return
          })
      })
  },
  [types.LOAD_ENVIRONMENTS] ({commit}) {
    let loadedEnv

    try {
      loadedEnv = JSON.parse(localStorage.getItem(ENVIRONMENT_ITEM_NAME) || '{}')
      commit(types.SET_ENVIRONMENTS, loadedEnv)
    } catch (e) {
      commit(types.SET_ENVIRONMENTS, {})
    }
  }
}
