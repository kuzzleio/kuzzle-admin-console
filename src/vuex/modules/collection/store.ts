import Promise from 'bluebird'
import { mergeMetaAttributes } from '../../../services/collectionHelper'
import Vue from 'vue'
import { formatSchema } from '../../../services/collectionHelper'
import { CollectionState, CollectionActions } from './types'
import {
  createModule,
  createMutations,
  createActions,
  ActionImpl
} from 'direct-vuex'
import { moduleActionContext } from '@/vuex/store'
import { getters } from './getters'

const state: CollectionState = {
  name: undefined,
  mapping: {},
  isRealtimeOnly: false,
  schema: {},
  allowForm: true,
  defaultViewJson: false
}

export const mutations = createMutations<CollectionState>()({
  receiveCollectionDetail(state, payload) {
    state.name = payload.name
    state.mapping = payload.mapping
    state.isRealtimeOnly = payload.isRealtimeOnly
    state.schema = payload.schema
    state.allowForm = payload.allowForm
  },
  resetCollectionDetail(state) {
    state.name = undefined
    state.mapping = {}
    state.schema = {}
    state.isRealtimeOnly = false
    state.allowForm = true
  },
  setMapping(state, payload) {
    state.mapping = payload
  },
  setSchema(state, payload) {
    state.schema = formatSchema(payload)
  },
  setAllowForm(state, payload) {
    state.allowForm = payload
  },
  setRealtimeOnly(state, payload) {
    state.isRealtimeOnly = payload
  },
  setCollectionName(state, payload) {
    state.name = payload
  },
  setCollectionDefaultView(state, { jsonView }) {
    state.defaultViewJson = jsonView
  },
  setCollectionDefaultViewJson(state, json) {
    state.defaultViewJson = json
  }
})

const actions = createActions({
  createCollection(context, { index }) {
    const { state } = collectionActionContext(context)

    return Vue.prototype.$kuzzle.collection.create(
      index,
      state.name,
      mergeMetaAttributes({
        mapping: state.mapping,
        schema: state.schema,
        allowForm: state.allowForm
      })
    )
  },
  updateCollection(context, { index }) {
    const { state } = collectionActionContext(context)

    if (state.isRealtimeOnly) {
      return Promise.resolve()
    }

    return Vue.prototype.$kuzzle.query({
      controller: 'collection',
      action: 'updateMapping',
      collection: state.name,
      index,
      body: mergeMetaAttributes({
        mapping: state.mapping,
        schema: state.schema,
        allowForm: state.allowForm
      })
    })
  },
  async fetchCollectionDetail(context, { index, collection }) {
    const { commit, dispatch, rootGetters } = collectionActionContext(context)

    if (!collection) {
      commit.resetCollectionDetail()
      return
    }

    if (
      rootGetters.index.indexCollections(index).stored.indexOf(collection) !==
      -1
    ) {
      let mappings = await Vue.prototype.$kuzzle.collection.getMapping(
        index,
        collection
      )
      let schema = {}
      let allowForm = false

      if (mappings._meta) {
        schema = mappings._meta.schema || {}
        allowForm = mappings._meta.allowForm || false
      }

      dispatch.getCollectionDefaultViewJson({
        index,
        collection
      })

      commit.receiveCollectionDetail({
        name: collection,
        mapping: mappings.properties || {},
        schema,
        allowForm,
        isRealtimeOnly: false
      })
    }

    if (
      rootGetters.index.indexCollections(index).realtime.indexOf(collection) !==
      -1
    ) {
      commit.receiveCollectionDetail({
        name: collection,
        mapping: {},
        isRealtimeOnly: true,
        schema: {},
        allowForm: false
      })
    }
  },
  getCollectionDefaultViewJson(context, { index, collection }) {
    const { dispatch } = collectionActionContext(context)

    let indexes = JSON.parse(localStorage.getItem('defaultJsonView') || '{}')
    if (!indexes[index]) {
      return dispatch.setCollectionDefaultViewJson({
        index,
        collection,
        jsonView: false
      })
    }

    return dispatch.setCollectionDefaultViewJson({
      index,
      collection,
      jsonView: indexes[index][collection] || false
    })
  },
  setCollectionDefaultViewJson(context, { index, collection, jsonView }) {
    const { commit } = collectionActionContext(context)

    let indexes = JSON.parse(localStorage.getItem('defaultJsonView') || '{}')
    if (!indexes[index]) {
      indexes[index] = {}
    }

    indexes[index][collection] = jsonView

    localStorage.setItem('defaultJsonView', JSON.stringify(indexes))
    return commit.setCollectionDefaultViewJson({ jsonView })
  },
  async clearCollection({ state }, { index }) {
    await Vue.prototype.$kuzzle.query({
      controller: 'collection',
      action: 'truncate',
      index,
      collection: state.name,
      refresh: 'wait_for'
    })
  }
})

const collection = createModule({
  namespaced: true,
  state,
  mutations,
  actions,
  getters
})

export default collection
export const collectionActionContext = (context: any) =>
  moduleActionContext(context, collection)
