import { createGetters } from 'direct-vuex'
import { RoutingState } from './types'

export const getters = createGetters<RoutingState>()({
  routeBeforeRedirect: state => {
    return state.routeBeforeRedirect
  }
})
