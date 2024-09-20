import { defineGetters } from 'direct-vuex'
import { RoutingState } from './types'

export const getters = defineGetters<RoutingState>()({
  routeBeforeRedirect: state => {
    return state.routeBeforeRedirect
  }
})
