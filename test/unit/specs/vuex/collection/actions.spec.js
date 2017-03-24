import {
  RECEIVE_COLLECTION_DETAIL,
  FETCH_COLLECTION_DETAIL
} from '../../../../../src/vuex/modules/collection/mutation-types'
import actionsInjector from 'inject-loader!../../../../../src/vuex/modules/collection/actions'
import {testActionPromise} from '../../helper'

describe('Collections module', () => {
  describe('Create collection', () => {
    let state = {
      data: {
        indexesAndCollections: {}
      }
    }

    beforeEach(() => {
      // eslint-disable-next-line no-undef
      localStorage.clear()
    })

    describe('fetchCollectionDetail', () => {
      it('should do nothing if collection is not in stored and not in realtime', (done) => {
        let actions = actionsInjector({
          '../../../services/kuzzle': {
            queryPromise: sinon.stub()
          }
        })

        testActionPromise(actions.default[FETCH_COLLECTION_DETAIL], {
          index: 'myindex',
          collection: 'toto'
        }, state, [], done, null, {indexCollections: () => {
          return {realtime: [], stored: ['tutu']}
        }})
          .catch(e => {
            expect(e.message).to.equals('Unknown collection toto')
            done()
          })
      })

      it('should dispatch event with collection and realtime', (done) => {
        let actions = actionsInjector({
          '../../../services/kuzzle': {
            queryPromise: sinon.stub()
          }
        })

        testActionPromise(actions.default[FETCH_COLLECTION_DETAIL], {
          index: 'myindex',
          collection: 'toto'
        }, state, [
          {type: RECEIVE_COLLECTION_DETAIL, payload: {name: 'toto', mapping: {}, isRealtimeOnly: true, schema: {}, allowForm: false}}
        ], done, null, {indexCollections: () => {
          return {realtime: ['toto'], stored: ['tutu']}
        }})
      })

      it('should get mapping if collection is stored', (done) => {
        let actions = actionsInjector({
          '../../../services/kuzzle': {
            queryPromise: ({controller, action}, {collection, index}) => {
              return Promise.resolve({
                result: {
                  [index]: {
                    mappings: {
                      [collection]: {
                        properties: {toto: 'tutu'}
                      }
                    }
                  }
                }
              })
            }
          }
        })

        testActionPromise(actions.default[FETCH_COLLECTION_DETAIL], {
          index: 'myindex',
          collection: 'tutu'
        }, state, [
          {type: RECEIVE_COLLECTION_DETAIL, payload: {name: 'tutu', mapping: {toto: 'tutu'}, schema: {}, isRealtimeOnly: false, allowForm: false}}
        ], done, null, {indexCollections: () => {
          return {realtime: ['toto'], stored: ['tutu']}
        }})
      })
    })
  })
})
