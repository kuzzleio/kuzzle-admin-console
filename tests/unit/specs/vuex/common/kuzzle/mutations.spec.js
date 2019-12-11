import { mutations } from '../../../../../../src/vuex/modules/common/kuzzle/store'
import {
  CONNECT_TO_ENVIRONMENT,
  RESET,
  CREATE_ENVIRONMENT,
  UPDATE_ENVIRONMENT,
  DELETE_ENVIRONMENT,
  SET_ERROR_FROM_KUZZLE
} from '../../../../../../src/vuex/modules/common/kuzzle/mutation-types'
import { expect } from 'chai'

let state

describe('kuzzle environments mutations test', () => {
  beforeEach(() => {
    state = {
      environments: {
        local: {
          name: 'local',
          host: 'localhost',
          port: 7512
        }
      },
      connectedTo: null,
      lastConnectedEnv: null
    }
  })

  describe('CONNECT_TO_ENVIRONMENT', () => {
    it('should throw if the id is invalid', () => {
      expect(() => {
        mutations[CONNECT_TO_ENVIRONMENT](this, state, 'foo')
      }).to.throw(Error)
      expect(() => {
        mutations[CONNECT_TO_ENVIRONMENT](state, null)
      }).to.throw(Error)
    })

    it('should set connectedTo to the valid given id', () => {
      mutations[CONNECT_TO_ENVIRONMENT](state, 'local')

      expect(state.connectedTo).to.equals('local')
    })
  })

  describe('RESET', () => {
    it('should reset connectedTo', () => {
      state.connectedTo = 'local'

      mutations[RESET](state)
      expect(state.connectedTo).to.equals(null)
    })
  })

  describe('CREATE_ENVIRONMENT', () => {
    it('should not add a falsy environment', () => {
      expect(() => {
        mutations[CREATE_ENVIRONMENT](state, false)
      }).to.throw(Error)
    })

    it('should not overwrite an existing environment', () => {
      expect(() => {
        mutations[CREATE_ENVIRONMENT](state, { environment: {}, id: 'local' })
      }).to.throw(Error)
    })

    it('should create a new environment', () => {
      let newEnvironment = {
        host: 'localhost',
        port: 7512
      }
      mutations[CREATE_ENVIRONMENT](state, {
        id: 'new',
        environment: newEnvironment
      })
      expect(state.environments.new).to.deep.equals(newEnvironment)
    })
  })

  describe('UPDATE_ENVIRONMENT', () => {
    it('should throw if the environment does not exist', () => {
      expect(() => {
        mutations[UPDATE_ENVIRONMENT](state, {
          id: 'unexisting',
          environment: {}
        })
      }).to.throw(Error)
      expect(() => {
        mutations[UPDATE_ENVIRONMENT](state, { id: null, environment: {} })
      }).to.throw(Error)
      expect(() => {
        mutations[UPDATE_ENVIRONMENT](state, { id: undefined, environment: {} })
      }).to.throw(Error)
    })

    it('should update an existing environment', () => {
      let newEnvironment = {
        host: 'localhost',
        port: 7512
      }
      mutations[UPDATE_ENVIRONMENT](state, {
        id: 'local',
        environment: newEnvironment
      })
      expect(state.environments.local).to.deep.equals(newEnvironment)
    })
  })

  describe('DELETE_ENVIRONMENT', () => {
    it('should return if the environment does not exist', () => {
      expect(() => {
        mutations[DELETE_ENVIRONMENT](state, 'unexisting', {})
      }).to.not.throw(Error)
      expect(() => {
        mutations[DELETE_ENVIRONMENT](state, null, {})
      }).to.not.throw(Error)
      expect(() => {
        mutations[DELETE_ENVIRONMENT](state, undefined, {})
      }).to.not.throw(Error)
    })

    it('should delete an existing environment', () => {
      mutations[DELETE_ENVIRONMENT](state, 'local')
      expect(state.environments.local).to.equals(undefined)
    })
  })

  describe('SET_ERROR_FROM_KUZZLE', () => {
    it('should set an error', () => {
      mutations[SET_ERROR_FROM_KUZZLE](state, 'error')
      expect(state.errorFromKuzzle).to.equals('error')
    })
  })
})
