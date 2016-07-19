import { testAction } from '../helper'
import {
  TOGGLE_SELECT_DOCUMENT
} from '../../../../src/vuex/modules/collection/mutation-types'
import { toggleSelectDocuments } from '../../../../src/vuex/modules/collection/actions'

describe('collection actions', () => {
  describe('toggleSelectDocuments', () => {
    it('should do nothing if id is undefined', (done) => {
      testAction(toggleSelectDocuments, [], {}, [], done)
    })

    it('should dispatch toggle with right id', (done) => {
      testAction(toggleSelectDocuments, ['toto'], {}, [{ name: TOGGLE_SELECT_DOCUMENT, payload: ['toto'] }], done)
    })
  })
})
