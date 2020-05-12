import { KuzzleState } from './types'
import { createGetters } from 'direct-vuex'

export const getters = createGetters<KuzzleState>()({
  wrapper(state, getters) {
    if (!getters.currentEnvironment) {
      return null
    }
    switch (getters.currentEnvironment.backendMajorVersion) {
      case 1:
        return require('../../../services/kuzzleWrapper-v1')
      case 2:
        return require('../../../services/kuzzleWrapper-v2')
      default:
        return require('../../../services/kuzzleWrapper-v2')
    }
  },
  $kuzzle(state, getters) {
    return getters.wrapper.kuzzle
  },
  currentEnvironment(state, getters) {
    if (!getters.hasEnvironment) {
      return null
    }

    if (!state.currentId) {
      return null
      // const firstKey = Object.keys(state.environments)[0]
      // return state.environments[firstKey]
    }

    return state.environments[state.currentId]
  },
  hasEnvironment(state) {
    return Object.keys(state.environments).length !== 0
  },
  environments(state) {
    // DAFUQ IZ DIS 4?
    return state.environments
  }
})
