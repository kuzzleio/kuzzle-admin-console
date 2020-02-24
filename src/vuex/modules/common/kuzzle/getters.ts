import { KuzzleState } from './types'
import { createGetters } from 'direct-vuex'

export const getters = createGetters<KuzzleState>()({
  // kuzzleIsConnected(state) {
  //   return state.connectedTo !== null
  // },
  // currentEnvironmentId(state) {
  //   return state.connectedTo
  // },
  currentEnvironment(state, getters) {
    if (!getters.hasEnvironment) {
      return null
    }

    if (!state.currentId) {
      const firstKey = Object.keys(state.environments)[0]
      return state.environments[firstKey]
    }

    return state.environments[state.currentId]
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
  environments(state) {
    // DAFUQ IZ DIS 4?
    return state.environments
  }
})
