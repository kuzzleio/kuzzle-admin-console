import kuzzle from '../../../services/kuzzle'
import * as types from './mutation-types'
import { RECEIVE_COLLECTION_DETAIL } from '../collection/mutation-types'
import Promise from 'bluebird'

export default {
  [types.FETCH_USER_MAPPING] ({commit}) {
    return kuzzle
      .queryPromise({
        controller: 'security',
        action: 'getUserMapping'
      }, {})
      .then(res => {
        res.result.schema = {}
        commit(RECEIVE_COLLECTION_DETAIL, res.result)
        return Promise.resolve(res.result.mapping)
      })
  },
  [types.FETCH_PROFILE_MAPPING] ({commit}) {
    return kuzzle
      .queryPromise({
        controller: 'security',
        action: 'getProfileMapping'
      }, {})
      .then(res => {
        res.result.schema = {}
        commit(RECEIVE_COLLECTION_DETAIL, res.result)
        return Promise.resolve(res.result.mapping)
      })
  },
  [types.FETCH_ROLE_MAPPING] ({commit}) {
    return kuzzle
      .queryPromise({
        controller: 'security',
        action: 'getRoleMapping'
      }, {})
      .then(res => {
        res.result.schema = {}
        commit(RECEIVE_COLLECTION_DETAIL, res.result)
        return Promise.resolve(res.result.mapping)
      })
  }
}
