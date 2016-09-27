import Promise from 'bluebird'
const environmentInjector = require('inject!../../../../src/services/environment')
let sandbox = sinon.sandbox.create()
let environment
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
  dispatch: sandbox.stub()
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

  describe('loadEnvironments', () => {
    let envService
    let addEnvironmentStub = sandbox.stub()

    beforeEach(() => {
      envService = environmentInjector({
        '../vuex/store': dummyStore,
        '../vuex/modules/common/kuzzle/actions': {
          addEnvironment: addEnvironmentStub
        }
      })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should create default environment when none are available in localstorage', () => {
      // eslint-disable-next-line no-undef
      sandbox.stub(localStorage, 'getItem')

      envService.loadEnvironments()
      expect(addEnvironmentStub.calledWithMatch(dummyStore, 'default')).to.equals(true)
    })

    it('should return the first environment when lastConnected is invalid', () => {
      const SAVED_ENV = 'savedEnvironment'

      // eslint-disable-next-line no-undef
      let getItem = sandbox.stub(localStorage, 'getItem')
      getItem
        .withArgs('environments')
        .returns(JSON.stringify({
          [SAVED_ENV]: {}
        }))
      getItem
        .withArgs('lastConnectedEnv')
        .returns(null)

      let envToConnect = envService.loadEnvironments()
      expect(envToConnect).to.equals(SAVED_ENV)

      getItem
        .withArgs('lastConnectedEnv')
        .returns('tralala')

      envToConnect = envService.loadEnvironments()
      expect(envToConnect).to.equals(SAVED_ENV)
    })

    it('should return the lastConnected id when it is valid', () => {
      const SAVED_ENV = 'savedEnvironment'

      // eslint-disable-next-line no-undef
      let getItem = sandbox.stub(localStorage, 'getItem')
      getItem
        .withArgs('environments')
        .returns(JSON.stringify({
          anotherEnv: {},
          [SAVED_ENV]: {}
        }))
      getItem
        .withArgs('lastConnectedEnv')
        .returns(SAVED_ENV)

      let envToConnect = envService.loadEnvironments()
      expect(envToConnect).to.equals(SAVED_ENV)
    })
  })

  describe('validateEnvironment', () => {
    it('should throw when the name is invalid', () => {
      expect(environment.validateEnvironment.bind(this)).to.throw(Error)
      expect(environment.validateEnvironment.bind(this, null)).to.throw(Error)
      expect(environment.validateEnvironment.bind(this, '')).to.throw(Error)
    })

    it('should throw when the hostname is invalid', () => {
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name')
      ).to.throw(Error)
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', null)
      ).to.throw(Error)
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', '')
      ).to.throw(Error)
    })

    it('should throw if an invalid ioPort is provided', () => {
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', 'localhost')
      ).to.throw(Error)
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', 'localhost', 'invalid ioPort')
      ).to.throw(Error)
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', 'localhost', -1)
      ).to.throw(Error)
    })

    it('should throw when the wsPort is invalid', () => {
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', 'localhost', null)
      ).to.throw(Error)
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', 'localhost', null, null)
      ).to.throw(Error)
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', 'localhost', null, 'invalid wsPort')
      ).to.throw(Error)
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', 'localhost', null, -1)
      ).to.throw(Error)
      expect(
        environment
          .validateEnvironment
          .bind(this, 'valid name', 'localhost', null, 7513)
      ).to.not.throw(Error)
    })
  })

  describe('createEnvironment', () => {
    let envService
    let addEnvironmentStub = sandbox.stub()

    beforeEach(() => {
      envService = environmentInjector({
        '../vuex/store': dummyStore,
        '../vuex/modules/common/kuzzle/actions': {
          addEnvironment: addEnvironmentStub
        }
      })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should assign default color when no color is provided', () => {
      envService.validateEnvironment = sandbox.spy()
      let resultEnv = envService.createEnvironment(
        'environment',
        null,
        'localhost',
        7512,
        7513
      )
      expect(resultEnv.color).to.equals('#00757f')
    })
  })

  describe('deleteEnvironment', () => {
    let envService
    let deleteEnvironmentStub = sandbox.stub()

    beforeEach(() => {
      envService = environmentInjector({
        '../vuex/store': dummyStore,
        '../vuex/modules/common/kuzzle/actions': {
          deleteEnvironment: deleteEnvironmentStub
        }
      })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('deletes an environment', () => {
      sandbox.stub(envService, 'persistEnvironments')
      envService.deleteEnvironment()
      expect(envService.deleteEnvironment.bind(this, 'toto')).to.not.throw(Error)
    })
  })

  describe('persistEnvironments', () => {
    it('does not throw when environments are OK', () => {
      expect(
        environment
          .persistEnvironments
          .bind(this, dummyEnvironments)
      ).to.not.throw(Error)
    })
  })

  describe('updateEnvironment', () => {
    let envService
    let updateEnvironmentStub = sandbox.stub()

    beforeEach(() => {
      envService = environmentInjector({
        '../vuex/store': dummyStore,
        '../vuex/modules/common/kuzzle/actions': {
          updateEnvironment: updateEnvironmentStub
        }
      })
      sandbox.stub(envService, 'persistEnvironments')
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should throw if the environment does not exist', () => {
      expect(envService
        .updateEnvironment.bind(this, 'notExisting')
      ).to.throw(Error)
    })

    it('should update with the correct values if the environment exists', () => {
      const host = 'localhost'
      const color = '#000'
      const name = 'toto'
      const ioPort = 7582
      const wsPort = 7545

      const updatedEnv = envService
        .updateEnvironment('valid', name, color, host, ioPort, wsPort)

      expect(updatedEnv.host).to.equals(host)
      expect(updatedEnv.color).to.equals(color)
      expect(updatedEnv.name).to.equals(name)
      expect(updatedEnv.ioPort).to.equals(ioPort)
      expect(updatedEnv.wsPort).to.equals(wsPort)
      expect(updatedEnv.user).to.equals(dummyEnvironments['valid'].user)
    })
  })

  describe('setUserToCurrentEnviromnent', () => {
    let envService
    let updateEnvironmentStub = sandbox.stub()

    beforeEach(() => {
      envService = environmentInjector({
        '../vuex/store': dummyStore,
        '../vuex/modules/common/kuzzle/actions': {
          updateEnvironment: updateEnvironmentStub
        }
      })
      sandbox.stub(envService, 'persistEnvironments')
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should not throw', () => {
      let user = {
        token: 'token'
      }
      expect(envService.setUserToCurrentEnvironment.bind(this, user)).to.not.throw(Error)
      expect(updateEnvironmentStub.called).to.equals(true)
    })
  })
})
