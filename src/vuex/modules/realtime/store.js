import * as types from './mutation-types'

const state = {
  notifications: []
}

export const mutations = {
  [types.ADD_NOTIFICATION] (state, notification) {
    state.notifications.push(notification)
  },
  [types.EMPTY_NOTIFICATION] (state) {
    state.notifications = []
  }
}

export default {
  state,
  mutations
}
