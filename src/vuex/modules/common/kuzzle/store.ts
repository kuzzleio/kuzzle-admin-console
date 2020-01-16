import Vue from 'vue'
import { createMutations, createModule, createActions } from 'direct-vuex'
import { KuzzleState } from './types'
import { moduleActionContext } from '@/vuex/store'
import { getters } from './getters'
import {
  waitForConnected,
  connectToEnvironment
} from '../../../../services/kuzzleWrapper'

const ENVIRONMENT_ITEM_NAME = 'environments'
const LAST_CONNECTED_NAME = 'lastConnectedEnv'
export const state: KuzzleState = {
  environments: {},
  lastConnectedEnv: undefined,
  connectedTo: undefined,
  errorFromKuzzle: undefined,
  host: '',
  port: 0
}

const mutations = createMutations<KuzzleState>()({
  createEnvironment(state, payload) {
    if (!payload) {
      throw new Error(`The environment can't be falsy`)
    }
    if (Object.keys(state.environments).indexOf(payload.id) !== -1) {
      throw new Error(
        `Unable to add new environment to already existing id "${payload.id}"`
      )
    }

    state.environments = {
      ...state.environments,
      [payload.id]: payload.environment
    }
  },
  updateEnvironment(state, payload) {
    if (Object.keys(state.environments).indexOf(payload.id) === -1) {
      throw new Error(`The given id ${payload.id} does not correspond to any existing
        environment.`)
    }
    state.environments = {
      ...state.environments,
      [payload.id]: payload.environment
    }
  },
  deleteEnvironment(state, id) {
    if (Object.keys(state.environments).indexOf(id) === -1) {
      return
    }
    Vue.delete(state.environments, id)
  },
  connectToEnvironment(state, id) {
    if (id === null) {
      throw new Error(
        'Cannot connect to a null environment. To reset connection, use the RESET mutation.'
      )
    }
    if (Object.keys(state.environments).indexOf(id) === -1) {
      throw new Error(
        `The given id ${id} does not correspond to any existing environment.`
      )
    }
    state.connectedTo = id
  },
  setErrorFromKuzzle(state, error) {
    state.errorFromKuzzle = error
  },
  setEnvironments(state, payload) {
    state.environments = { ...payload }
  },
  setLastConnectedEnvironment(state, payload) {
    state.lastConnectedEnv = payload
  },
  reset(state) {
    state.connectedTo = undefined
  }
})

const actions = createActions({
  setConnection(context, id) {
    const { dispatch, commit } = kuzzleActionContext(context)
    commit.connectToEnvironment(id)
    dispatch.setLastConnectedEnvironment(id)
  },
  createEnvironment(context, payload) {
    const { dispatch, commit, state } = kuzzleActionContext(context)

    commit.createEnvironment(payload)
    localStorage.setItem(
      ENVIRONMENT_ITEM_NAME,
      JSON.stringify(state.environments)
    )

    dispatch.switchEnvironment(payload.id)
  },
  deleteEnvironment(context, id) {
    const { dispatch, commit, state } = kuzzleActionContext(context)
    commit.deleteEnvironment(id)

    if (state.lastConnectedEnv === id) {
      dispatch.setLastConnectedEnvironment(null)
      localStorage.removeItem(LAST_CONNECTED_NAME)
    }

    localStorage.setItem(
      ENVIRONMENT_ITEM_NAME,
      JSON.stringify(state.environments)
    )
  },
  updateTokenCurrentEnvironment(context, payload) {
    const { commit, state, getters } = kuzzleActionContext(context)
    commit.updateEnvironment({
      id: getters.currentEnvironmentId,
      environment: {
        ...getters.currentEnvironment,
        token: payload
      }
    })

    localStorage.setItem(
      ENVIRONMENT_ITEM_NAME,
      JSON.stringify(state.environments)
    )
  },
  updateEnvironment(context, payload) {
    const { dispatch, commit, state, getters } = kuzzleActionContext(context)
    commit.updateEnvironment({
      id: payload.id,
      environment: payload.environment
    })
    localStorage.setItem(
      ENVIRONMENT_ITEM_NAME,
      JSON.stringify(state.environments)
    )

    if (
      getters.currentEnvironment &&
      getters.currentEnvironment.name &&
      getters.currentEnvironment.name !== payload.id
    ) {
      dispatch.switchEnvironment(payload.id)
    }
  },
  switchLastEnvironment(context) {
    const { dispatch, state } = kuzzleActionContext(context)
    if (Object.keys(state.environments).length === 0) {
      return Promise.resolve()
    }

    let lastConnectedEnv = state.lastConnectedEnv

    if (!lastConnectedEnv) {
      lastConnectedEnv = Object.keys(state.environments)[0]
      dispatch.setLastConnectedEnvironment(lastConnectedEnv)
    }

    return dispatch.switchEnvironment(lastConnectedEnv)
  },
  async switchEnvironment(context, id) {
    const { rootDispatch, commit, dispatch, state } = kuzzleActionContext(
      context
    )
    if (!id) {
      throw new Error('No id provided')
    }

    let environment = state.environments[id]
    if (!environment) {
      throw new Error(`Id ${id} does not match any environment`)
    }

    commit.reset()

    connectToEnvironment(environment)
    dispatch.setConnection(id)

    await waitForConnected(1000)
    await rootDispatch.auth.loginByToken({ token: environment.token })
    await rootDispatch.auth.checkFirstAdmin()
    return true
  },
  loadEnvironments(context) {
    let loadedEnv
    let lastConnectedEnv
    const { commit } = kuzzleActionContext(context)

    try {
      loadedEnv = JSON.parse(
        localStorage.getItem(ENVIRONMENT_ITEM_NAME) || '{}'
      )
      commit.setEnvironments(loadedEnv)
      lastConnectedEnv = localStorage.getItem(LAST_CONNECTED_NAME)
      commit.setLastConnectedEnvironment(lastConnectedEnv)
    } catch (e) {
      commit.setEnvironments({})
    }
  },
  setLastConnectedEnvironment(context, payload) {
    const { commit } = kuzzleActionContext(context)

    localStorage.setItem(LAST_CONNECTED_NAME, payload)
    commit.setLastConnectedEnvironment(payload)
  }
})

const kuzzle = createModule({
  namespaced: true,
  state,
  mutations,
  getters,
  actions
})

export default kuzzle
export const kuzzleActionContext = (context: any) =>
  moduleActionContext(context, kuzzle)
