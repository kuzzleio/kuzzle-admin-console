import Vue from 'vue'
import { createMutations, createModule, createActions } from 'direct-vuex'
import { KuzzleState } from './types'
import { moduleActionContext } from '@/vuex/store'
import { getters } from './getters'

export const LS_ENVIRONMENTS = 'environments'
export const LS_CURRENT_ENV = 'currentEnv'
export const state: KuzzleState = {
  environments: {},
  currentId: undefined,
  connecting: true,
  online: false,
  errorFromKuzzle: undefined
}

export const DEFAULT_COLOR = 'darkblue'

export const envColors = [
  DEFAULT_COLOR,
  'lightblue',
  'purple',
  'green',
  'orange',
  'red',
  'grey',
  'magenta'
]

const checkEnvironment = e => {
  if (!e.name) {
    throw new Error(`Invalid environment name: ${e.name}`)
  }
  if (!e.host) {
    throw new Error(`Invalid environment host: ${e.host}`)
  }
  if (!e.port) {
    throw new Error(`Invalid environment port: ${e.port}`)
  }
  if (typeof e.port !== 'number') {
    throw new Error(
      `Type of environment port is invalid: ${e.port} (must be a number)`
    )
  }
  if (e.ssl === undefined || e.ssl === null) {
    throw new Error('SSL parameter not found (must be a boolean)')
  }
  if (!e.color) {
    throw new Error(`Invalid environment color: ${e.color}`)
  }
  if (!envColors.includes(e.color)) {
    throw new Error(`Invalid environment color: ${e.color}`)
  }
  return true
}

const mutations = createMutations<KuzzleState>()({
  createEnvironment(state, payload) {
    if (!payload) {
      return
    }
    if (Object.keys(state.environments).indexOf(payload.id) !== -1) {
      return
    }
    try {
      if (checkEnvironment(payload.environment)) {
        state.environments = {
          ...state.environments,
          [payload.id]: payload.environment
        }
      }
    } catch (error) {
      throw new Error(`[${payload.id}] - ${error.message}`)
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
  setErrorFromKuzzle(state, error) {
    state.errorFromKuzzle = error
  },
  setCurrentEnvironment(state, payload) {
    state.currentId = payload
  },
  setConnecting(state, value: boolean) {
    state.connecting = value
  },
  setOnline(state, value: boolean) {
    state.online = value
  }
})

const actions = createActions({
  setCurrentEnvironment(context, payload) {
    const { commit } = kuzzleActionContext(context)

    localStorage.setItem(LS_CURRENT_ENV, payload)
    commit.setCurrentEnvironment(payload)
  },
  createEnvironment(context, payload) {
    const { dispatch, commit, state } = kuzzleActionContext(context)

    commit.createEnvironment(payload)
    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(state.environments))

    return payload.id
  },
  deleteEnvironment(context, id) {
    const { dispatch, commit, state } = kuzzleActionContext(context)
    commit.deleteEnvironment(id)

    if (state.currentId === id) {
      dispatch.setCurrentEnvironment(null)
      localStorage.removeItem(LS_CURRENT_ENV)
    }

    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(state.environments))
  },
  updateTokenCurrentEnvironment(context, payload) {
    const { commit, state, getters } = kuzzleActionContext(context)
    commit.updateEnvironment({
      id: state.currentId,
      environment: {
        ...getters.currentEnvironment,
        token: payload
      }
    })

    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(state.environments))
  },
  updateEnvironment(context, payload) {
    const { dispatch, commit, state, getters } = kuzzleActionContext(context)
    let mustReconnect = false

    if (
      payload.id === state.currentId &&
      (payload.environment.host !== getters.currentEnvironment.host ||
        payload.environment.port !== getters.currentEnvironment.port ||
        payload.environment.ssl !== getters.currentEnvironment.ssl)
    ) {
      mustReconnect = true
    }
    commit.updateEnvironment({
      id: payload.id,
      environment: payload.environment
    })
    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(state.environments))
    if (mustReconnect) {
      dispatch.switchEnvironment(payload.id)
    }
  },
  async connectToCurrentEnvironment(context) {
    const { dispatch, state, getters } = kuzzleActionContext(context)
    if (!getters.hasEnvironment) {
      return
    }

    let currentId = state.currentId

    if (!currentId) {
      throw new Error('No current environment selected')
    }

    return dispatch.switchEnvironment(currentId)
  },
  async switchEnvironment(context, id) {
    const {
      rootDispatch,
      commit,
      dispatch,
      state,
      getters
    } = kuzzleActionContext(context)
    if (!id) {
      throw new Error('No id provided')
    }

    let environment = state.environments[id]
    if (!environment) {
      throw new Error(`Id ${id} does not match any environment`)
    }
    commit.setErrorFromKuzzle(null)

    if (getters.$kuzzle) {
      getters.$kuzzle.disconnect()
    }
    commit.setConnecting(true)
    dispatch.setCurrentEnvironment(id)

    await getters.wrapper.connectToEnvironment(environment)
    commit.setConnecting(false)
    commit.setOnline(true)

    await rootDispatch.auth.init(environment)

    return true
  },
  loadEnvironments(context) {
    let loadedEnv
    let currentId
    const { commit } = kuzzleActionContext(context)

    loadedEnv = JSON.parse(localStorage.getItem(LS_ENVIRONMENTS) || '{}')
    Object.keys(loadedEnv).forEach(envName => {
      commit.createEnvironment({
        environment: loadedEnv[envName],
        id: envName
      })
    })

    currentId = localStorage.getItem(LS_CURRENT_ENV)
    commit.setCurrentEnvironment(currentId)
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
