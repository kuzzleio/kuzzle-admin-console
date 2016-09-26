import Promise from 'bluebird'
const environmentInjector = require('inject!../../../../src/services/environment')
let sandbox = sinon.sandbox.create()
let environment
let dummyEnvironments = {
  valid: {
    host: 'localhost'
  },
  invalid: {
    host: 'not.existing.host'
  }
}
let dummyStore = {
  store: {
    state: {
      environments: dummyEnvironments,
      connectedTo: null
    },
    dispatch: sandbox.stub()
  }
}
let waitForConnectedStub = sandbox.stub().returns(Promise.resolve())
let connectToEnvironmentStub = sandbox.stub()
let setConnectionStub = sandbox.stub()
let loginFromSessionStub = sandbox.stub().returns(Promise.resolve({id: 'user'}))
let checkFirstAdminStub = sandbox.stub().returns(Promise.resolve())

const createMock = () => {
  environment = environmentInjector({
    './kuzzleWrapper': {
      waitForConnected: waitForConnectedStub,
      connectToEnvironment: connectToEnvironmentStub
    },
    '../vuex/actions': {
      reset: sandbox.mock()
    },
    '../vuex/store': dummyStore,
    '../vuex/modules/common/kuzzle/getters': {
      environments: sandbox.stub().returns(dummyEnvironments)
    },
    '../vuex/modules/common/kuzzle/actions': {
      setConnection: setConnectionStub
    },
    '../vuex/modules/auth/actions': {
      loginFromSession: loginFromSessionStub,
      checkFirstAdmin: checkFirstAdminStub
    }
  })
}

describe('Environment service', () => {
  beforeEach(() => {
    createMock()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('switchEnvironment', () => {
    it('should throw when id is falsy', () => {
      expect(environment.switchEnvironment.bind(environment, null)).to.throw(Error)
      expect(environment.switchEnvironment.bind(environment, undefined)).to.throw(Error)
      expect(environment.switchEnvironment.bind(environment, false)).to.throw(Error)
    })

    it('should throw when called with unexisting id', () => {
      expect(environment.switchEnvironment.bind(environment, 'unexisting')).to.throw(Error)
    })

    it('should call loginFromSession if the environment id corresponds to a working environment', (done) => {
      let envId = 'valid'
      environment.switchEnvironment(envId).then(() => {
        expect(loginFromSessionStub.called).to.equals(true)

        done()
      })
    })

    it('should call checkFirstAdmin if the environment id corresponds to a working environment, and no user id is available', (done) => {
      loginFromSessionStub = sandbox.stub().returns(Promise.resolve({}))
      createMock()

      let envId = 'valid'
      environment.switchEnvironment(envId).then(() => {
        expect(checkFirstAdminStub.called).to.equals(true)

        done()
      })
    })

    it('should not call loginFromSession if the environment is not working', (done) => {
      loginFromSessionStub = sandbox.stub().returns(Promise.resolve({}))
      waitForConnectedStub = sandbox.stub().returns(Promise.reject(new Error()))
      createMock()

      let envId = 'valid'
      environment.switchEnvironment(envId)
        .catch(() => {
          expect(loginFromSessionStub.called).to.equals(false)

          done()
        })
    })
  })
})
