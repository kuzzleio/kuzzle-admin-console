import { expect } from 'chai'
import { mutations } from '../../../../src/vuex/modules/data/store'

const { RECEIVE_INDEXES_COLLECTIONS } = mutations

describe('data mutations test', () => {
  it('should set indexes and collections', () => {
    let state = {user: null}

    RECEIVE_INDEXES_COLLECTIONS(state, 'foo')
    expect(state.indexesAndCollections).to.equals('foo')
  })
})
