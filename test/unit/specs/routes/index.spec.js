import { expect } from 'chai'
const createRoutesInjector = require('inject!../../../../src/routes/index')
import VueRouter from 'vue-router'

describe('Router login redirect', () => {
  it('should redirect to login page', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: true } }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(false),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go({name: 'Home'})
    expect(transition.redirect.calledWith('/login')).to.be.ok
  })

  it('should not go to login because user already logged', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), from: {name: 'Home'}, to: {name: 'Login', auth: true} }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go('/login')
    expect(transition.redirect.calledWith('/login')).to.not.be.ok
  })

  it('should go to signup if there is no admin', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: true } }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(false),
        adminAlreadyExists: sinon.stub().returns(false)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go({name: 'Home'})
    expect(transition.redirect.calledWith('/signup')).to.be.ok
  })

  it('should not go to signup because admin already exists', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), from: {name: 'Home'}, to: {name: 'Signup', auth: true} }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go('/signup')
    expect(transition.redirect.calledWith('/signup')).to.not.be.ok
  })

  it('should go to error kuzzle disconnected if kuzzle is not connected', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: true } }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(false),
        adminAlreadyExists: sinon.stub().returns(false)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(false)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go({name: 'Home'})
    expect(transition.redirect.calledWith('/error/kuzzle-disconnected')).to.be.ok
  })

  it('should go to home because kuzzle is connected', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), from: {name: 'Home'}, to: {name: 'KuzzleDisconnectedPage'} }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go('/error/kuzzle-disconnected')
    expect(transition.redirect.calledWith('/')).to.be.ok
  })

  it('should go to the transition', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: false } }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true),
        adminAlreadyExists: sinon.stub().returns(true)
      },
      '../vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: sinon.stub().returns(true)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go('/login')
    expect(transition.next.called).to.be.true
  })
})
