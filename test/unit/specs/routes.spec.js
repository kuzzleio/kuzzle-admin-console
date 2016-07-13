import { expect } from 'chai'
const createRoutesInjector = require('inject?../vuex/getters!../../../src/routes/index')
import VueRouter from 'vue-router'

describe('Router test', () => {
  let vueRouter = new VueRouter()
  let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: true } }

  vueRouter.beforeEach = (f) => {
    f(transition)
  }

  const createRoutes = createRoutesInjector({
    '../vuex/getters': {
      isAuthenticated () {
        return false
      }
    }
  })

  it('should redirect to login page', () => {
    createRoutes.default(vueRouter)
    vueRouter.go('/')
    expect(transition.redirect.calledWith('/login')).to.be.ok
  })
})

describe('Router test', () => {
  let vueRouter = new VueRouter()
  let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: false } }

  vueRouter.beforeEach = (f) => {
    f(transition)
  }

  const createRoutes = createRoutesInjector({
    '../vuex/getters': {
      isAuthenticated () {
        return true
      }
    }
  })

  it('should go to the transition', () => {
    createRoutes.default(vueRouter)
    vueRouter.go('/login')
    expect(transition.next.called).to.be.true
  })
})

describe('Router test', () => {
  let vueRouter = new VueRouter()
  let transition = { redirect: sinon.spy(), next: sinon.spy(), from: { path: '/' }, to: {path: '/login'} }

  vueRouter.beforeEach = (f) => {
    f(transition)
  }

  const createRoutes = createRoutesInjector({
    '../vuex/getters': {
      isAuthenticated () {
        return true
      }
    }
  })

  it('should not go to login because user already logged', () => {
    createRoutes.default(vueRouter)
    vueRouter.go('/login')
    expect(transition.redirect.calledWith('/')).to.be.ok
  })
})
