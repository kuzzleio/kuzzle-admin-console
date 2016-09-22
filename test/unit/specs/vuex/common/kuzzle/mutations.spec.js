import { mutations } from '../../../../../../src/vuex/modules/common/kuzzle/store'
const { CONNECT_TO_ENVIRONMENT, RESET } = mutations

let state

describe('kuzzle environments mutations test', () => {
  beforeEach(() => {
    state = {
      environments: {
        valid: {},
        invalid: {}
      },
      connectedTo: null
    }
  })

  describe('CONNECT_TO_ENVIRONMENT', () => {
    it('should throw if the id is invalid', () => {
      expect(CONNECT_TO_ENVIRONMENT.bind(state, 'foo')).to.throw(Error)
      expect(CONNECT_TO_ENVIRONMENT.bind(state, null)).to.throw(Error)
    })

    it('should set connectedTo to the valid given id', () => {
      CONNECT_TO_ENVIRONMENT(state, 'valid')

      expect(state.connectedTo).to.equals('valid')
    })
  })

  describe('RESET', () => {
    it('should reset connectedTo', () => {
      state.connectedTo = 'valid'

      RESET(state)
      expect(state.connectedTo).to.equals(null)
    })
  })
})
