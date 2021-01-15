import { DELETE_ENVIRONMENT } from '../../../../src/vuex/modules/common/kuzzle/mutation-types'
import { DO_LOGOUT } from '../../../../src/vuex/modules/auth/mutation-types'
import { expect } from 'chai'
import sinon from 'sinon'
require('chai').use(require('sinon-chai'))

const environmentInjector = require('inject-loader!../../../../src/services/environment')

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
    currentEnvironment: { current: 'environment' },
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

  describe('deleteEnvironment', () => {
    it('should call deleteEnvironment', () => {
      envService.deleteEnvironment('toto')
      expect(
        dummyStore.dispatch.calledWith(DELETE_ENVIRONMENT, 'toto')
      ).to.be.equal(true)
    })

    it('should logout if the current environment is deleted', () => {
      envService.deleteEnvironment('currentEnvironmentId')
      expect(dummyStore.dispatch.calledWith(DO_LOGOUT)).to.be.equal(true)
    })
  })
})
