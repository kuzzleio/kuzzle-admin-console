import kuzzle from '../../../services/kuzzle'
import * as types from './mutation-types'
import * as dataTypes from '../data/mutation-types'
import Promise from 'bluebird'
import {mergeMetaAttributes} from '../../../services/collectionHelper'

export default {
  [types.CREATE_COLLECTION] ({commit, state}, {index, existingCollections}) {
    if (!state.name) {
      return Promise.reject(new Error('Invalid collection name'))
    }

    if (existingCollections.stored.indexOf(state.name) !== -1 ||
      existingCollections.realtime.indexOf(state.name) !== -1) {
      return Promise.reject(new Error(`Collection "${state.name}" already exist`))
    }

    if (state.isRealTime) {
      let collections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')
      collections.push({index: index, collection: state.name})
      localStorage.setItem('realtimeCollections', JSON.stringify(collections))
      commit(dataTypes.ADD_REALTIME_COLLECTION, {index: index, name: state.name})
      return Promise.resolve()
    }

    return kuzzle
      .queryPromise({
        controller: 'collection',
        action: 'updateMapping'
      }, {
        collection: state.name,
        index,
        body: mergeMetaAttributes({mapping: state.mapping, schema: state.schema, allowForm: state.allowForm})
      })
      .then(() => {
        commit(dataTypes.ADD_STORED_COLLECTION, {index: index, name: state.name})
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.UPDATE_COLLECTION] ({commit, state}, {index}) {
    if (state.isRealtime) {
      return Promise.resolve()
    }

    return kuzzle
      .queryPromise({
        controller: 'collection',
        action: 'updateMapping'
      }, {
        collection: state.name,
        index,
        body: mergeMetaAttributes({mapping: state.mapping, schema: state.schema, allowForm: state.allowForm})
      })
  },
  [types.FETCH_COLLECTION_DETAIL] ({commit}, payload) {
    if (payload.collections.stored.indexOf(payload.collection) !== -1) {
      return kuzzle
        .queryPromise({
          controller: 'collection',
          action: 'getMapping'
        }, {
          collection: payload.collection,
          index: payload.index
        })
        .then(response => {
          let result = response.result[payload.index].mappings[payload.collection]
          let schema = {}
          let allowForm = false

          if (result._meta) {
            schema = result._meta.schema || {}
            allowForm = result._meta.allowForm || false
          }

          commit(types.RECEIVE_COLLECTION_DETAIL, {
            name: payload.collection,
            mapping: result.properties,
            schema,
            allowForm,
            isRealtimeOnly: false
          })
        })
        .catch(error => Promise.reject(new Error(error.message)))
    }

    if (payload.collections.realtime.indexOf(payload.collection) !== -1) {
      commit(types.RECEIVE_COLLECTION_DETAIL, {name: payload.collection, mapping: {}, isRealtimeOnly: true, schema: {}, allowForm: false})
      return Promise.resolve()
    }

    return Promise.reject(new Error(`Unknown collection ${payload.collection}`))
  }
}
