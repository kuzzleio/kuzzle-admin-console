import { expect } from 'chai'
const createRoutesInjector = require('inject!../../../../src/routes/index')
import VueRouter from 'vue-router'

let testNextRoute = (toName, from, auth, createRoutes) => {
  let next = sinon.spy()
  VueRouter.prototype.beforeEach = (cb) => {
    cb({toName, matched: [{meta: {auth}}]}, from, next)
  }
  let router = createRoutes.default(VueRouter)

  router.push({toName})
  return next
}

describe('Router login redirect', () => {
  it('should redirect to login page', () => {
    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(false),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    expect(testNextRoute('Login', {}, true, createRoutes).calledWith('/login')).to.be.equal(true)
  })

  it('should not go to login because user already logged', () => {
    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    expect(testNextRoute('Login', {name: 'Home'}, true, createRoutes).calledWith('/login')).to.be.equal(false)
  })

  it('should go to signup if there is no admin', () => {
    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(false),
        adminAlreadyExists: sinon.stub().returns(false)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    expect(testNextRoute('Home', {}, true, createRoutes).calledWith('/signup')).to.be.equal(true)
  })

  it('should not go to signup because admin already exists', () => {
    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    expect(testNextRoute('Signup', {name: 'Home'}, true, createRoutes).calledWith('/signup')).to.be.equal(false)
  })

  it('should go to the transition', () => {
    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    expect(testNextRoute('Login', {}, false, createRoutes).called).to.be.equal(true)
  })
})
