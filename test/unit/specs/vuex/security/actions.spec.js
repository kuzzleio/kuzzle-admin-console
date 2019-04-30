import * as types from '../../../../../src/vuex/modules/security/mutation-types'
import { RECEIVE_COLLECTION_DETAIL } from '../../../../../src/vuex/modules/collection/mutation-types'
import { testActionPromise } from '../../helper'

const actionsInjector = require('inject-loader!../../../../../src/vuex/modules/security/actions')

describe('Security module', () => {
  let actions
  let exampleMapping = {
    kikkou: 'LOL'
  }
  let resultMapping = {
    ...exampleMapping,
    schema: {}
  }

  beforeEach(() => {
    actions = actionsInjector({
      'vue': {
        prototype: {
          $kuzzle: {
            query: () => {
              return Promise.resolve({
                result: exampleMapping
              })
            }
          }
        }
      }
    })
  })

  describe('fetch user mapping', () => {
    it('should commit mutation with proper mapping', done => {
      testActionPromise(
        actions.default[types.FETCH_USER_MAPPING],
        null,
        {},
        [
          {
            type: RECEIVE_COLLECTION_DETAIL,
            payload: resultMapping
          }
        ],
        done
      )
    })
  })

  describe('fetch profile mapping', () => {
    it('should commit mutation with proper mapping', done => {
      testActionPromise(
        actions.default[types.FETCH_PROFILE_MAPPING],
        null,
        {},
        [
          {
            type: RECEIVE_COLLECTION_DETAIL,
            payload: resultMapping
          }
        ],
        done
      )
    })
  })

  describe('fetch role mapping', () => {
    it('should commit mutation with proper mapping', done => {
      testActionPromise(
        actions.default[types.FETCH_ROLE_MAPPING],
        null,
        {},
        [
          {
            type: RECEIVE_COLLECTION_DETAIL,
            payload: resultMapping
          }
        ],
        done
      )
    })
  })
})
