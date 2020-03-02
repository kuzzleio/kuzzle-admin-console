import Vue from 'vue'
import { createMutations, createModule, createActions } from 'direct-vuex'
import { KuzzleState } from './types'
import { moduleActionContext } from '@/vuex/store'
import { getters } from './getters'
import {
  connectToEnvironment,
  disconnect
} from '../../../../services/kuzzleWrapper'

const LS_ENVIRONMENTS = 'environments'
const LS_CURRENT_ENV = 'currentId'
export const state: KuzzleState = {
  environments: {},
  currentId: undefined,
  isConnected: false,
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
  setErrorFromKuzzle(state, error) {
    state.errorFromKuzzle = error
  },
  setEnvironments(state, payload) {
    state.environments = { ...payload }
  },
  setCurrentEnvironment(state, payload) {
    if (payload === null) {
      throw new Error(
        'Cannot connect to a null environment. To reset connection, use the RESET mutation.'
      )
    }
    if (Object.keys(state.environments).indexOf(payload) === -1) {
      throw new Error(
        `The given id ${payload} does not correspond to any existing environment.`
      )
    }
    state.currentId = payload
  },
  reset(state) {
    state.isConnected = false
  },
  setConnected(state, value: boolean) {
    state.isConnected = value
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

    dispatch.switchEnvironment(payload.id)
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
    commit.updateEnvironment({
      id: payload.id,
      environment: payload.environment
    })
    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(state.environments))

    if (
      getters.currentEnvironment &&
      getters.currentEnvironment.name &&
      getters.currentEnvironment.name !== payload.id
    ) {
      dispatch.switchEnvironment(payload.id)
    }
  },
  async switchLastEnvironment(context) {
    const { dispatch, state } = kuzzleActionContext(context)
    if (Object.keys(state.environments).length === 0) {
      return Promise.resolve()
    }

    let currentId = state.currentId

    if (!currentId) {
      currentId = Object.keys(state.environments)[0]
      dispatch.setCurrentEnvironment(currentId)
    }

    return dispatch.switchEnvironment(currentId)
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

    disconnect()
    commit.setConnected(false)
    dispatch.setCurrentEnvironment(id)

    try {
      await connectToEnvironment(environment)
      commit.setConnected(true)
    } catch (error) {
      commit.setErrorFromKuzzle(error.message)
      return false
    }

    rootDispatch.auth.checkFirstAdmin()
    if (environment.token) {
      await rootDispatch.auth.loginByToken({ token: environment.token })
      return true
    }
    return true
  },
  loadEnvironments(context) {
    let loadedEnv
    let currentId
    const { commit } = kuzzleActionContext(context)

    try {
      loadedEnv = JSON.parse(localStorage.getItem(LS_ENVIRONMENTS) || '{}')
      commit.setEnvironments(loadedEnv)
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
      commit.setEnvironments({})
    }

    try {
      currentId = localStorage.getItem(LS_CURRENT_ENV)
      commit.setCurrentEnvironment(currentId)
    } catch (error) {
      // eslint-disable-next-line
      console.warn(
        `Something went wrong while setting the current environment, ${error.message}`
      )
    }
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
