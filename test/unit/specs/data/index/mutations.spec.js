import { mutations } from '../../../../../src/vuex/modules/data/store'

const { RECEIVE_COLLECTIONS } = mutations

describe('data watch mutations test', () => {
  it('should set the collection list', () => {
    let state = {collections: null}

    RECEIVE_COLLECTIONS(state, {stored: {foo: 'bar'}, realtime: {bar: 'foo'}})
    expect(state.collections.stored.foo).to.equals('bar')
    expect(state.collections.realtime.bar).to.equals('foo')
  })
})
