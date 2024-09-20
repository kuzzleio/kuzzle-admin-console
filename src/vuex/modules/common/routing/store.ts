import { RoutingState } from './types'
import { defineModule, defineMutations } from 'direct-vuex'
import { getters } from './getters'

const state: RoutingState = {
  routeBeforeRedirect: undefined
}

export const mutations = defineMutations<RoutingState>()({
  setRouteBeforeRedirect(state, value) {
    state.routeBeforeRedirect = value
  }
})

const routing = defineModule({
  namespaced: true,
  state,
  mutations,
  getters
})

export default routing
