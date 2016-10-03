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
let loginByTokenStub = sandbox.stub().returns(Promise.resolve({id: 'user'}))
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
      loginByToken: loginByTokenStub,
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

  describe('loadEnvironments', () => {
    it('should create default environment when none are available in localstorage', () => {
      // eslint-disable-next-line no-undef
      sandbox.stub(localStorage, 'getItem').returns(null)
      let env = environment.loadEnvironments()
      expect(env).to.have.property('default')
    })

    it('should return the stored environments when available', () => {
      // eslint-disable-next-line no-undef
      sandbox.stub(localStorage, 'getItem').returns(
        JSON.stringify(dummyEnvironments))
      let env = environment.loadEnvironments()
      expect(env).to.deep.equals(dummyEnvironments)
    })
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

    it('should call loginByToken if the environment id corresponds to a working environment', (done) => {
      let envId = 'valid'
      environment.switchEnvironment(envId).then(() => {
        expect(loginByTokenStub.called).to.equals(true)

        done()
      })
    })

    it('should call checkFirstAdmin if the environment id corresponds to a working environment, and no user id is available', (done) => {
      loginByTokenStub = sandbox.stub().returns(Promise.resolve({}))
      createMock()

      let envId = 'valid'
      environment.switchEnvironment(envId).then(() => {
        expect(checkFirstAdminStub.called).to.equals(true)

        done()
      })
    })

    it('should not call loginByToken if the environment is not working', (done) => {
      loginByTokenStub = sandbox.stub().returns(Promise.resolve({}))
      waitForConnectedStub = sandbox.stub().returns(Promise.reject(new Error()))
      createMock()

      let envId = 'valid'
      environment.switchEnvironment(envId)
        .catch(() => {
          expect(loginByTokenStub.called).to.equals(false)

          done()
        })
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

  describe('setTokenToCurrentEnviromnent', () => {
    let envService
    let updateEnvironmentStub = sandbox.stub()

    beforeEach(() => {
      envService = environmentInjector({
        '../vuex/store': dummyStore,
        '../vuex/modules/common/kuzzle/actions': {
          updateEnvironment: updateEnvironmentStub
        }
      })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should not throw', () => {
      expect(envService.setTokenToCurrentEnvironment.bind(this, 'token')).to.not.throw(Error)
      expect(envService.setTokenToCurrentEnvironment.bind(this, null)).to.not.throw(Error)
      expect(updateEnvironmentStub.called).to.equals(true)
    })
  })
})
