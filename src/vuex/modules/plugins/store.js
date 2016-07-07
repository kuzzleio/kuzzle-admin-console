import {
  ADD_ITEM,
  ADD_GROUP
} from './mutation-types'

const state = {
  elements: {}
}

const mutations = {
  [ADD_GROUP] (state, name) {},
  [ADD_ITEM] (state, name, callback, payload) {
    console.log('Adding item ', name)
  }
}

export default {
  state,
  mutations
}
