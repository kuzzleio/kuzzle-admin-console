import * as types from './mutation-types'
import * as authTypes from '../../auth/mutation-types'
import { waitForConnected, connectToEnvironment } from '../../../../services/kuzzleWrapper'

const ENVIRONMENT_ITEM_NAME = 'environments'
const LAST_CONNECTED_NAME = 'lastConnectedEnv'

export default {
  [types.SET_CONNECTION] ({commit, dispatch}, id) {
    commit(types.CONNECT_TO_ENVIRONMENT, id)
    dispatch(types.SET_LAST_CONNECTED_ENVIRONMENT, id)
  },
  [types.CREATE_ENVIRONMENT] ({commit, state, dispatch}, payload) {
    try {
      commit(types.CREATE_ENVIRONMENT, payload)
    } catch (e) {
      console.warn(`Unable to add ${payload.id}. Got the following error
      ${e.message}`)
    }

    localStorage.setItem(ENVIRONMENT_ITEM_NAME, JSON.stringify(state.environments))

    return dispatch(types.SWITCH_ENVIRONMENT, payload.id)
  },
  [types.DELETE_ENVIRONMENT] ({commit, state, dispatch}, id) {
    commit(types.DELETE_ENVIRONMENT, id)

    if (state.lastConnectedEnv === id) {
      dispatch(types.SET_LAST_CONNECTED_ENVIRONMENT, null)
      localStorage.removeItem(LAST_CONNECTED_NAME)
    }

    localStorage.setItem(ENVIRONMENT_ITEM_NAME, JSON.stringify(state.environments))
  },
  [types.UPDATE_ENVIRONMENT] ({commit, state, getters, dispatch}, payload) {
    commit(types.UPDATE_ENVIRONMENT, {id: payload.id, environment: payload.environment})
    localStorage.setItem(ENVIRONMENT_ITEM_NAME, JSON.stringify(state.environments))

    if (getters.currentEnvironment && getters.currentEnvironment.name && getters.currentEnvironment.name === payload.id) {
      return dispatch(types.SWITCH_ENVIRONMENT, payload.id)
    }

    return Promise.resolve()
  },
  [types.SWITCH_LAST_ENVIRONMENT] ({state, dispatch}) {
    if (Object.keys(state.environments).length === 0) {
      return Promise.resolve()
    }

    let lastConnectedEnv = state.lastConnectedEnv

    if (!lastConnectedEnv) {
      lastConnectedEnv = Object.keys(state.environments)[0]
      dispatch(types.SET_LAST_CONNECTED_ENVIRONMENT, lastConnectedEnv)
    }

    return dispatch(types.SWITCH_ENVIRONMENT, lastConnectedEnv)
  },
  [types.SWITCH_ENVIRONMENT] ({commit, state, dispatch}, id) {
    if (!id) {
      return Promise.reject(new Error('No id provided'))
    }

    let environment = state.environments[id]
    if (!environment) {
      throw new Error(`Id ${id} does not match any environment`)
    }

    commit(types.RESET)

    connectToEnvironment(environment)
    dispatch(types.SET_CONNECTION, id)

    return waitForConnected(1000)
      .then(() => dispatch(authTypes.LOGIN_BY_TOKEN, {token: environment.token}))
      .then(() => dispatch(authTypes.CHECK_FIRST_ADMIN))
      .catch((e) => {
        commit(types.SET_ERROR_FROM_KUZZLE, true)
        return Promise.reject(e)
      })
  },
  [types.LOAD_ENVIRONMENTS] ({commit}) {
    let loadedEnv
    let lastConnectedEnv

    try {
      loadedEnv = JSON.parse(localStorage.getItem(ENVIRONMENT_ITEM_NAME) || '{}')
      commit(types.SET_ENVIRONMENTS, loadedEnv)
      lastConnectedEnv = localStorage.getItem(LAST_CONNECTED_NAME)
      commit(types.SET_LAST_CONNECTED_ENVIRONMENT, lastConnectedEnv)
    } catch (e) {
      commit(types.SET_ENVIRONMENTS, {})
    }
  },
  [types.SET_LAST_CONNECTED_ENVIRONMENT] ({commit}, payload) {
    localStorage.setItem(LAST_CONNECTED_NAME, payload)
    commit(types.SET_LAST_CONNECTED_ENVIRONMENT, payload)
  }
}
