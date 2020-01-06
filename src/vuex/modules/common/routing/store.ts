import { RoutingState } from './types'
import { createMutations, createModule } from 'direct-vuex'
import { getters } from './getters'

const state: RoutingState = {
  routeBeforeRedirect: undefined
}

export const mutations = createMutations<RoutingState>()({
  setRouteBeforeRedirect(state, value) {
    state.routeBeforeRedirect = value
  }
})

const routing = createModule({
  namespaced: true,
  state,
  mutations,
  getters
})

export default routing
