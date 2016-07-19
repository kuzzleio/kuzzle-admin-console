import { testAction } from '../helper'
import {
  TOGGLE_SELECT_DOCUMENT,
  SET_PAGINATION
} from '../../../../src/vuex/modules/collection/mutation-types'
import { toggleSelectDocuments, setPagination } from '../../../../src/vuex/modules/collection/actions'

describe('collection actions', () => {
  describe('toggleSelectDocuments', () => {
    it('should do nothing if id is undefined', (done) => {
      testAction(toggleSelectDocuments, [], {}, [], done)
    })

    it('should dispatch toggle with right id', (done) => {
      testAction(toggleSelectDocuments, ['toto'], {}, [{ name: TOGGLE_SELECT_DOCUMENT, payload: ['toto'] }], done)
    })
  })

  describe('setPagination', () => {
    it('should do nothing if missing parameters', (done) => {
      testAction(setPagination, [], {}, [], done)
    })

    it('should do nothing if missing one parameter', (done) => {
      testAction(setPagination, [1], {}, [], done)
    })

    it('should dispatch event with correct from/size with current page 1', (done) => {
      testAction(setPagination, [1, 10], {}, [{ name: SET_PAGINATION, payload: [{from: 0, size: 10}] }], done)
    })

    it('should dispatch event with correct from/size with current page 10', (done) => {
      testAction(setPagination, [10, 10], {}, [{ name: SET_PAGINATION, payload: [{from: 90, size: 10}] }], done)
    })
  })
})
