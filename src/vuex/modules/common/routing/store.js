import {
  SET_ROUTE_BEFORE_REDIRECT
} from './mutation-types'

const state = {
  routeBeforeRedirect: null
}

const mutations = {
  [SET_ROUTE_BEFORE_REDIRECT] (state, value) {
    state.routeBeforeRedirect = value
  }
}

export default {
  state,
  mutations
}
