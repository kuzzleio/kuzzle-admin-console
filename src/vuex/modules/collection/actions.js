import * as types from './mutation-types'
import Promise from 'bluebird'
import { mergeMetaAttributes } from '../../../services/collectionHelper'
import Vue from 'vue'

export default {
  [types.CREATE_COLLECTION]({ state }, { index }) {
    return Vue.prototype.$kuzzle.query(
      {
        controller: 'collection',
        action: 'create'
      },
      {
        collection: state.name,
        index,
        body: mergeMetaAttributes({
          mapping: state.mapping,
          schema: state.schema,
          allowForm: state.allowForm
        })
      }
    )
  },
  [types.UPDATE_COLLECTION]({ state }, { index }) {
    if (state.isRealtimeOnly) {
      return Promise.resolve()
    }

    return Vue.prototype.$kuzzle.query(
      {
        controller: 'collection',
        action: 'updateMapping',
        collection: state.name,
        index,
        body: mergeMetaAttributes({
          mapping: state.mapping,
          schema: state.schema,
          allowForm: state.allowForm
        })
      }
    )
  },
  async [types.FETCH_COLLECTION_DETAIL](
    { commit, getters, dispatch },
    { index, collection }
  ) {
    if (!collection) {
      commit(types.RESET_COLLECTION_DETAIL)
      return
    }

    if (getters.indexCollections(index).stored.indexOf(collection) !== -1) {
      const response = await Vue.prototype.$kuzzle.collection.getMapping(index, collection)
      let result = response[index].mappings[collection]
      let schema = {}
      let allowForm = false

      if (result._meta) {
        schema = result._meta.schema || {}
        allowForm = result._meta.allowForm || false
      }

      dispatch(types.GET_COLLECTION_DEFAULT_VIEW_JSON, {
        index,
        collection
      })

      commit(types.RECEIVE_COLLECTION_DETAIL, {
        name: collection,
        mapping: result || {},
        schema,
        allowForm,
        isRealtimeOnly: false
      })
    }

    if (getters.indexCollections(index).realtime.indexOf(collection) !== -1) {
      commit(types.RECEIVE_COLLECTION_DETAIL, {
        name: collection,
        mapping: {},
        isRealtimeOnly: true,
        schema: {},
        allowForm: false
      })
    }
  },
  [types.GET_COLLECTION_DEFAULT_VIEW_JSON](
    { dispatch },
    { index, collection }
  ) {
    let indexes = JSON.parse(localStorage.getItem('defaultJsonView') || '{}')
    if (!indexes[index]) {
      return dispatch(types.SET_COLLECTION_DEFAULT_VIEW_JSON, {
        index,
        collection,
        jsonView: false
      })
    }

    return dispatch(types.SET_COLLECTION_DEFAULT_VIEW_JSON, {
      index,
      collection,
      jsonView: indexes[index][collection] || false
    })
  },
  [types.SET_COLLECTION_DEFAULT_VIEW_JSON](
    { commit },
    { index, collection, jsonView }
  ) {
    let indexes = JSON.parse(localStorage.getItem('defaultJsonView') || '{}')
    if (!indexes[index]) {
      indexes[index] = {}
    }

    indexes[index][collection] = jsonView

    localStorage.setItem('defaultJsonView', JSON.stringify(indexes))
    return commit(types.SET_COLLECTION_DEFAULT_VIEW_JSON, { jsonView })
  },
  async [types.CLEAR_COLLECTION]({ state }, { index }) {
    await Vue.prototype.$kuzzle
      .query(
        {
          controller: 'collection',
          action: 'truncate',
          index,
          collection: state.name,
          refresh: 'wait_for'
        }
      )
  }
}
