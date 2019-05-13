import kuzzle from '../../../services/kuzzle'
import * as types from './mutation-types'
import Promise from 'bluebird'
import { mergeMetaAttributes } from '../../../services/collectionHelper'

export default {
  [types.CREATE_COLLECTION]({ state }, { index }) {
    return kuzzle.queryPromise(
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
  [types.UPDATE_COLLECTION]({ commit, state }, { index }) {
    if (state.isRealtimeOnly) {
      return Promise.resolve()
    }

    return kuzzle.queryPromise(
      {
        controller: 'collection',
        action: 'updateMapping'
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
  [types.FETCH_COLLECTION_DETAIL](
    { commit, getters, state, dispatch },
    { index, collection }
  ) {
    if (!collection) {
      commit(types.RESET_COLLECTION_DETAIL)
      return Promise.resolve
    }

    if (getters.indexCollections(index).stored.indexOf(collection) !== -1) {
      return kuzzle
        .queryPromise(
          {
            controller: 'collection',
            action: 'getMapping'
          },
          {
            collection: collection,
            index: index
          }
        )
        .then(response => {
          let result = response.result[index].mappings[collection]
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
            mapping: result.properties || {},
            schema,
            allowForm,
            isRealtimeOnly: false
          })
        })
        .catch(error => Promise.reject(new Error(error.message)))
    }

    if (getters.indexCollections(index).realtime.indexOf(collection) !== -1) {
      commit(types.RECEIVE_COLLECTION_DETAIL, {
        name: collection,
        mapping: {},
        isRealtimeOnly: true,
        schema: {},
        allowForm: false
      })
      return Promise.resolve()
    }

    return Promise.reject(new Error(`Unknown collection ${collection}`))
  },
  [types.GET_COLLECTION_DEFAULT_VIEW_JSON](
    { commit, dispatch },
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
  [types.CLEAR_COLLECTION]({ state }, { index, collection }) {
    return kuzzle
      .queryPromise(
        {
          controller: 'collection',
          action: 'truncate'
        },
        {
          index,
          collection: state.name
        },
        {
          refresh: 'wait_for'
        }
      )
      .then(res => Promise.resolve)
      .catch(error => Promise.reject(new Error(error.message)))
  }
}
