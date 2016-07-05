import {
  SET_CURRENT_USER,
  SET_CURRENT_USER_RIGHTS,
  LOGOUT
} from './mutation-types'
import kuzzle from '../../../services/kuzzle'
import cookie from '../../../services/cookies'

const state = {
  user: null,
  rights: null
}

const mutations = {
  [SET_CURRENT_USER] (state, user) {
    state.user = user
  },
  [SET_CURRENT_USER_RIGHTS] (state, rights) {
    state.rights = rights
  },
  [LOGOUT] () {
    kuzzle.logout()
    cookie.delete()
    state.user = null
  }
}

export default {
  state,
  mutations
}
