import * as types from './mutation-types'
import { RECEIVE_COLLECTION_DETAIL } from '../collection/mutation-types'
import Vue from 'vue'

export default {
  async [types.FETCH_USER_MAPPING]({ commit }) {
    const res = await Vue.prototype.$kuzzle
      .query(
        {
          controller: 'security',
          action: 'getUserMapping'
        }
      )
    res.result.schema = {}
    commit(RECEIVE_COLLECTION_DETAIL, res.result)
  },
  async [types.FETCH_PROFILE_MAPPING]({ commit }) {
    const res = await Vue.prototype.$kuzzle
      .query(
        {
          controller: 'security',
          action: 'getProfileMapping'
        }
      )
    res.result.schema = {}
    commit(RECEIVE_COLLECTION_DETAIL, res.result)
  },
  async [types.FETCH_ROLE_MAPPING]({ commit }) {
    const res = await Vue.prototype.$kuzzle
      .query(
        {
          controller: 'security',
          action: 'getRoleMapping'
        }
      )
    res.result.schema = {}
    commit(RECEIVE_COLLECTION_DETAIL, res.result)
  }
}
