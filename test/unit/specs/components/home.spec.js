import { mockedComponent } from '../helper'
const homeInjector = require('!!vue?inject!../../../../src/components/Home')

describe('Home.vue tests', () => {
  let Home
  let sandbox = sinon.sandbox.create()

  before(() => {
    Home = homeInjector({
      './Common/MainMenu': mockedComponent,
      './Common/Login/Form': mockedComponent,
      './Materialize/Modal': mockedComponent,
      '../vuex/modules/auth/getters': {
        tokenValid: sandbox.stub().returns(false)
      }
    })
  })

  afterEach(() => sandbox.reset())

  describe('watch tests', () => {
    describe('tokenValid', () => {
      it('should open the login modal if value pass to false', () => {
        Home.watch.$broadcast = sandbox.stub()
        Home.watch.tokenValid(false)

        expect(Home.watch.$broadcast.calledWith('modal-open', 'tokenExpired')).to.be.ok
      })

      it('should do nothing if value pass to true', () => {
        Home.watch.$broadcast = sandbox.stub()
        Home.watch.tokenValid(true)

        expect(Home.watch.$broadcast.called).to.be.not.ok
      })
    })

    describe('kuzzleIsConnected', () => {
      it('should close the modal if kuzzle is connected', () => {
        Home.watch.$broadcast = sandbox.stub()
        Home.watch.kuzzleIsConnected(true)

        expect(Home.watch.$broadcast.calledWith('modal-close', 'kuzzleDisconnected')).to.be.equal(true)
      })

      it('should open the modal if kuzzle is connected', () => {
        Home.watch.$broadcast = sandbox.stub()
        Home.watch.kuzzleIsConnected(false)

        expect(Home.watch.$broadcast.calledWith('modal-open', 'kuzzleDisconnected')).to.be.equal(true)
      })
    })
  })

  describe('methods tests', () => {
    describe('onLogin', () => {
      it('should close the login modal if value pass to false', () => {
        Home.methods.$broadcast = sandbox.stub()
        Home.methods.onLogin()

        expect(Home.methods.$broadcast.calledWith('modal-close', 'tokenExpired')).to.be.ok
      })
    })
  })
})
