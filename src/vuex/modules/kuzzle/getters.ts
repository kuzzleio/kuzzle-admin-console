import { KuzzleState } from './types'
import { createGetters } from 'direct-vuex'
import * as kuzzleV1 from '../../../services/kuzzleWrapper-v1'
import * as kuzzleV2 from '../../../services/kuzzleWrapper-v2'

export const getters = createGetters<KuzzleState>()({
  wrapper(state, getters) {
    if (!getters.currentEnvironment) {
      return null
    }
    switch (getters.currentEnvironment.backendMajorVersion) {
      case 1:
        return kuzzleV1.wrapper
      case 2:
        return kuzzleV2.wrapper
      default:
        return kuzzleV2.wrapper
    }
  },
  $kuzzle(state, getters) {
    if (!getters.currentEnvironment) {
      return null
    }
    switch (getters.currentEnvironment.backendMajorVersion) {
      case 1:
        return kuzzleV1.kuzzle
      case 2:
        return kuzzleV2.kuzzle
      default:
        return kuzzleV2.kuzzle
    }
  },
  currentEnvironment(state, getters) {
    if (!getters.hasEnvironment) {
      return null
    }

    if (!state.currentId) {
      return null
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
