import {
  RECEIVE_COLLECTION_DETAIL,
  FETCH_COLLECTION_DETAIL,
  CLEAR_COLLECTION
} from '../../../../../src/vuex/modules/collection/mutation-types'
import actionsInjector from 'inject-loader!../../../../../src/vuex/modules/collection/actions'
import { testActionPromise } from '../../helper'
import { expect } from 'chai'
import sinon from 'sinon'
require('chai').use(require('sinon-chai'))

describe('Collections module', () => {
  describe('Create collection', () => {
    let state = {
      data: {
        indexesAndCollections: {}
      }
    }

    beforeEach(() => {
      localStorage.clear()
    })

    describe('fetchCollectionDetail', () => {
      it('should do nothing if collection is not in stored and not in realtime', done => {
        let actions = actionsInjector({
          vue: {
            prototype: {
              $kuzzle: {
                collection: {
                  getMapping: sinon.stub()
                }
              }
            }
          }
        })

        testActionPromise(
          actions.default[FETCH_COLLECTION_DETAIL],
          {
            index: 'myindex',
            collection: 'toto'
          },
          state,
          [],
          done,
          null,
          {
            indexCollections: () => {
              return { realtime: [], stored: ['tutu'] }
            }
          }
        ).catch(e => {
          expect(e.message).to.equals('Unknown collection toto')
          done()
        })
      })

      it('should dispatch event with collection and realtime', done => {
        let actions = actionsInjector({
          vue: {
            prototype: {
              $kuzzle: {
                collection: {
                  getMapping: sinon.stub()
                }
              }
            }
          }
        })

        testActionPromise(
          actions.default[FETCH_COLLECTION_DETAIL],
          {
            index: 'myindex',
            collection: 'toto'
          },
          state,
          [
            {
              type: RECEIVE_COLLECTION_DETAIL,
              payload: {
                name: 'toto',
                mapping: {},
                isRealtimeOnly: true,
                schema: {},
                allowForm: false
              }
            }
          ],
          done,
          null,
          {
            indexCollections: () => {
              return { realtime: ['toto'], stored: ['tutu'] }
            }
          }
        )
      })
    })
  })

  describe('Truncate collection', () => {
    let triggerError = true
    let actions = actionsInjector({
      vue: {
        prototype: {
          $kuzzle: {
            query: () => {
              if (triggerError) {
                return Promise.reject(new Error('error'))
              } else {
                return Promise.resolve({})
              }
            }
          }
        }
      }
    })

    it('should not dispatch the deleted index if kuzzle reject', done => {
      triggerError = true
      testActionPromise(
        actions.default[CLEAR_COLLECTION],
        ['myindex', 'toto'],
        {},
        [],
        done
      ).catch(error => {
        expect(error.message).to.be.equal('error')
        done()
      })
    })

    it('should dispatch the deleted index if success', done => {
      triggerError = false
      testActionPromise(
        actions.default[CLEAR_COLLECTION],
        ['myindex', 'toto'],
        {},
        [{ type: CLEAR_COLLECTION, payload: ['myindex', 'toto'] }],
        done
      ).then(() => {
        done()
      })
    })
  })
})
