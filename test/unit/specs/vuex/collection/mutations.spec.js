import { mutations } from '../../../../../src/vuex/modules/collection/store'
import {
  RECEIVE_COLLECTION_DETAIL,
  RESET_COLLECTION_DETAIL
} from '../../../../../src/vuex/modules/collection/mutation-types'

describe('Collection mutation test', () => {
  it('should set name, mapping and realtimeOnly correctly', () => {
    let state = { name: null, mapping: null, isRealtimeOnly: false }
    mutations[RECEIVE_COLLECTION_DETAIL](state, {
      name: 'toto',
      mapping: { toto: 'tutu' },
      isRealtimeOnly: true,
      schema: { tata: 'titi' },
      allowForm: true
    })

    expect(state.name).to.be.equal('toto')
    expect(state.mapping).to.deep.equal({ toto: 'tutu' })
    expect(state.schema).to.deep.equal({ tata: 'titi' })
    expect(state.isRealtimeOnly).to.be.equal(true)
    expect(state.allowForm).to.be.equal(true)
  })

  it('should reset the state on reset collection', () => {
    let state = {
      name: 'toto',
      mapping: { toto: 'tutu' },
      isRealtimeOnly: true
    }
    mutations[RESET_COLLECTION_DETAIL](state)

    expect(state.name).to.be.equal(null)
    expect(state.mapping).to.deep.equal({})
    expect(state.isRealtimeOnly).to.be.equal(false)
  })
})
