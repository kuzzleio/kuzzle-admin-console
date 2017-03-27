const environmentInjector = require('inject-loader!../../../../src/services/environment')
import {DELETE_ENVIRONMENT, UPDATE_ENVIRONMENT} from '../../../../src/vuex/modules/common/kuzzle/mutation-types'

let sandbox = sinon.sandbox.create()
let dummyEnvironments = {
  valid: {
    host: 'localhost',
    user: 'connectedUser'
  },
  invalid: {
    host: 'not.existing.host'
  }
}
let dummyStore = {
  state: {
    kuzzle: {
      environments: dummyEnvironments,
      connectedTo: null
    }
  },
  getters: {
    currentEnvironment: {current: 'environment'},
    currentEnvironmentId: 'currentEnvironmentId'
  },
  dispatch: sandbox.stub()
}
let envService

const createMock = () => {
  envService = environmentInjector({
    '../vuex/store': dummyStore
  })
}

describe('Environment service', () => {
  beforeEach(() => {
    createMock()
  })

  afterEach(() => {
    sandbox.restore()
    sandbox.reset()
  })

  describe('loadEnvironments', () => {
    it('should create default environment when none are available in localstorage', () => {
      sandbox.stub(localStorage, 'getItem').returns(null)
      let env = envService.loadEnvironments()
      expect(env).to.have.property('default')
    })

    it('should create default environment when the localstorage is not valid', () => {
      sandbox.stub(JSON, 'parse').throws()
      let env = envService.loadEnvironments()
      expect(env).to.have.property('default')
    })

    it('should return the stored environments when available', () => {
      // eslint-disable-next-line no-undef
      sandbox.stub(localStorage, 'getItem').returns(
        JSON.stringify(dummyEnvironments))
      let env = envService.loadEnvironments()
      expect(env).to.deep.equals(dummyEnvironments)
    })
  })

  describe('createEnvironment', () => {
    it('should assign default color when no color is provided', () => {
      let resultEnv = envService.createEnvironment(
        'environment',
        null,
        'localhost',
        7512
      )
      expect(resultEnv.color).to.equals(envService.DEFAULT_COLOR)
    })
  })

  describe('setTokenToCurrentEnvironment', () => {
    it('should call update environment action and return currentEnvironment', () => {
      let current = envService.setTokenToCurrentEnvironment('toto')
      expect(current).be.eql({current: 'environment'})
      expect(dummyStore.dispatch.calledWith(UPDATE_ENVIRONMENT, {
        id: 'currentEnvironmentId',
        environment: {
          current: 'environment',
          token: 'toto'
        }
      })).to.be.equal(true)
    })
  })

  describe('deleteEnvironment', () => {
    it('should call deleteEnvironment', () => {
      envService.deleteEnvironment('toto')
      expect(dummyStore.dispatch.calledWith(DELETE_ENVIRONMENT, 'toto')).to.be.equal(true)
    })
  })
})
