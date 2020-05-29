import { KuzzleState } from './types'
import { createGetters } from 'direct-vuex'

export const getters = createGetters<KuzzleState>()({
  currentEnvironment(state, getters) {
    if (!getters.hasEnvironment) {
      return null
    }

    if (!state.currentId) {
      return null
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
