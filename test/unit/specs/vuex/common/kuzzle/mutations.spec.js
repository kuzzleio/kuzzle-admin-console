import { mutations } from '../../../../../../src/vuex/modules/common/kuzzle/store'
const {
  CONNECT_TO_ENVIRONMENT,
  RESET,
  ADD_ENVIRONMENT,
  UPDATE_ENVIRONMENT,
  DELETE_ENVIRONMENT
} = mutations

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
      expect(CONNECT_TO_ENVIRONMENT.bind(this, state, 'foo')).to.throw(Error)
      expect(CONNECT_TO_ENVIRONMENT.bind(this, state, null)).to.throw(Error)
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

  describe('ADD_ENVIRONMENT', () => {
    it('should not add a falsy environment', () => {
      expect(ADD_ENVIRONMENT.bind(this, state, 'valid', null)).to.throw(Error)
    })

    it('should not overwrite an existing environment', () => {
      expect(ADD_ENVIRONMENT.bind(this, state, 'valid', {})).to.throw(Error)
    })

    it('should create a new environment', () => {
      let newEnvironment = {
        host: 'localhost',
        port: 7512
      }
      ADD_ENVIRONMENT(state, {id: 'new', environment: newEnvironment})
      expect(state.environments.new).to.deep.equals(newEnvironment)
    })
  })

  describe('UPDATE_ENVIRONMENT', () => {
    it('should throw if the environment does not exist', () => {
      expect(UPDATE_ENVIRONMENT.bind(this, state, {id: 'unexisting', environment: {}})).to.throw(Error)
      expect(UPDATE_ENVIRONMENT.bind(this, state, {id: null, environment: {}})).to.throw(Error)
      expect(UPDATE_ENVIRONMENT.bind(this, state, {id: undefined, environment: {}})).to.throw(Error)
    })

    it('should update an existing environment', () => {
      let newEnvironment = {
        host: 'localhost',
        port: 7512
      }
      UPDATE_ENVIRONMENT(state, {id: 'valid', environment: newEnvironment})
      expect(state.environments.valid).to.deep.equals(newEnvironment)
    })
  })

  describe('DELETE_ENVIRONMENT', () => {
    it('should return if the environment does not exist', () => {
      expect(DELETE_ENVIRONMENT.bind(this, state, 'unexisting', {})).to.not.throw(Error)
      expect(DELETE_ENVIRONMENT.bind(this, state, null, {})).to.not.throw(Error)
      expect(DELETE_ENVIRONMENT.bind(this, state, undefined, {})).to.not.throw(Error)
    })

    it('should delete an existing environment', () => {
      DELETE_ENVIRONMENT(state, 'valid')
      expect(state.environments).to.not.have.property('valid')
    })
  })
})
