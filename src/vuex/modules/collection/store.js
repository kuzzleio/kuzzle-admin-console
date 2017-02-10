import * as types from './mutation-types'
import * as getters from './getters'
import actions from './actions'
import {formatSchema} from '../../../services/collectionHelper'

const state = {
  name: null,
  mapping: {},
  isRealtimeOnly: false,
  editionStep: 1,
  schema: {},
  allowForm: false
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
    state.isRealtimeOnly = false
    state.editionStep = 1
    state.allowForm = false
  },
  [types.SET_EDITION_STEP] (state, payload) {
    state.editionStep = payload
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
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
