import { KuzzleState } from './types'
import { createGetters } from 'direct-vuex'

export const getters = createGetters<KuzzleState>()({
  kuzzleIsConnected(state) {
    return state.connectedTo !== null
  },
  currentEnvironmentId(state) {
    return state.connectedTo
  },
  currentEnvironment(state, getters) {
    if (!state.environments[getters.currentEnvironmentId]) {
      return null
    }
    return state.environments[getters.currentEnvironmentId]
  },
  hasEnvironment(state) {
    return Object.keys(state.environments).length !== 0
  },
  kuzzleHost(state) {
    return state.host
  },
  kuzzlePort(state) {
    return state.port
  },
  currentHttpUrl(state, getters) {
    // prettier-ignore
    return `${getters.currentEnvironment.ssl ? 'https' : 'http'}://${
      getters.currentEnvironment.host
      }:${getters.currentEnvironment.port}`
  },
  oldMappingSupport(state, getters) {
    if (!state.environments[getters.currentEnvironmentId]) {
      return null
    }

    return /^2/.test(
      state.environments[getters.currentEnvironmentId].storageEngineVersion
    )
  },
  environments(state) {
    return state.environments
  }
})
