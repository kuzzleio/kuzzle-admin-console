import { mutations } from '../../../../src/vuex/modules/data/store'

const { RECEIVE_INDEXES_COLLECTIONS, RECEIVE_MAPPING } = mutations

describe('data mutations test', () => {
  it('should set indexes and collections', () => {
    let state = {user: null}

    RECEIVE_INDEXES_COLLECTIONS(state, 'foo')
    expect(state.indexesAndCollections).to.equals('foo')
  })

  it('should set mapping', () => {
    let state = {mapping: null}

    RECEIVE_MAPPING(state, 'mapping')
    expect(state.mapping).to.equals('mapping')
  })
})
