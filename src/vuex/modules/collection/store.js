import * as types from './mutation-types'
import * as getters from './getters'
import actions from './actions'
import {formatSchema} from '../../../services/collectionHelper'

const state = {
  name: null,
  mapping: {},
  isRealtimeOnly: false,
  schema: {},
  allowForm: true,
  defaultViewJson: false
}

export const mutations = {
  [types.RECEIVE_COLLECTION_DETAIL] (state, payload) {
    state.name = payload.name
    state.mapping = payload.mapping
    state.isRealtimeOnly = payload.isRealtimeOnly
    state.schema = payload.schema
    state.allowForm = payload.allowForm
  },
  [types.RESET_COLLECTION_DETAIL] (state) {
    state.name = null
    state.mapping = {}
    state.schema = {}
    state.isRealtimeOnly = false
    state.allowForm = true
  },
  [types.SET_MAPPING] (state, payload) {
    state.mapping = payload
  },
  [types.SET_SCHEMA] (state, payload) {
    state.schema = formatSchema(payload)
  },
  [types.SET_ALLOW_FORM] (state, payload) {
    state.allowForm = payload
  },
  [types.SET_REALTIME_ONLY] (state, payload) {
    state.isRealtimeOnly = payload
  },
  [types.SET_COLLECTION_NAME] (state, payload) {
    state.name = payload
  },
  [types.SET_COLLECTION_DEFAULT_VIEW_JSON] (state, {jsonView}) {
    state.defaultViewJson = jsonView
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
